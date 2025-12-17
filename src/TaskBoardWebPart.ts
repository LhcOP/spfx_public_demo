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
  public render(): void {
    const element: React.ReactElement<ITaskBoardProps> = React.createElement(TaskBoard, {
      tasks: [],
      isLoading: true,
      onReload: () => this.loadTasks(),
      title: this.properties.listTitle || 'Tasks'
    });

    ReactDom.render(element, this.domElement);
    this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    const items = await this.fetchTasks();

    const element: React.ReactElement<ITaskBoardProps> = React.createElement(TaskBoard, {
      tasks: items,
      isLoading: false,
      onReload: () => this.loadTasks(),
      title: this.properties.listTitle || 'Tasks'
    });

    ReactDom.render(element, this.domElement);
  }

  private async fetchTasks(): Promise<ITaskItem[]> {
    const listTitle = encodeURIComponent(this.properties.listTitle || 'Tasks');
    const endpoint = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items` +
      `?$select=Id,Title,Status,DueDate,ParentId,Progress,AssignedTo/Title,AssignedTo/EMail&$expand=AssignedTo&$orderby=Id asc`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
    const json = await response.json();
    return json.value as ITaskItem[];
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
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
