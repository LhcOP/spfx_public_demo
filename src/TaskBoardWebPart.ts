import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import TaskBoard, { ITaskBoardProps } from './components/TaskBoard';

export interface ITaskItem {
  Id: number;
  Title: string;
  Status?: string;
  DueDate?: string;
  Progress?: number;
  ParentId?: number;
  AssignedTo?: {
    Title?: string;
    EMail?: string;
  };
}

export interface ITaskBoardWebPartProps {
  listTitle: string;
}

export default class TaskBoardWebPart extends BaseClientSideWebPart<ITaskBoardWebPartProps> {
  private tasks: ITaskItem[] = [];
  private isLoading = true;
  private error?: string;

  public render(): void {
    this.renderBoard();
    this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    this.isLoading = true;
    this.error = undefined;
    this.renderBoard();

    try {
      this.tasks = await this.fetchTasks();
    } catch (err) {
      // Helpful error for Workbench testing when list is missing or permissions are wrong
      this.error = `Kunne ikke hente opgaver fra listen "${this.properties.listTitle || 'Tasks'}". ` +
        'Tjek at listen findes, og at du har rettigheder.';
      this.tasks = [];
    }

    this.isLoading = false;
    this.renderBoard();
  }

  private async fetchTasks(): Promise<ITaskItem[]> {
    const listTitle = encodeURIComponent(this.properties.listTitle || 'Tasks');
    const endpoint = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
      `?$select=Id,Title,Status,DueDate,ParentId,Progress,AssignedTo/Title,AssignedTo/EMail&$expand=AssignedTo&$orderby=Id asc`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`SharePoint API fejl: ${response.statusText}`);
    }
    const json = await response.json();
    return json.value as ITaskItem[];
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private renderBoard(): void {
    const element: React.ReactElement<ITaskBoardProps> = React.createElement(TaskBoard, {
      tasks: this.tasks,
      isLoading: this.isLoading,
      onReload: () => this.loadTasks(),
      title: this.properties.listTitle || 'Tasks',
      error: this.error
    });

    ReactDom.render(element, this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Task board konfiguration' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('listTitle', {
                  label: 'SharePoint task-liste titel'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
