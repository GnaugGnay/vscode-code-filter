import { OutputChannel, window } from 'vscode';

import { LANGUAGE } from './constants';

class OutputManager {
  private channel: OutputChannel;
  private static instance: OutputManager;

  constructor() {
    this.channel = window.createOutputChannel('Code Filter', LANGUAGE);
  }

  public static getInstance() {
    if (!OutputManager.instance) {
      OutputManager.instance = new OutputManager();
    }

    return OutputManager.instance;
  }

  show(content: string) {
    this.channel.clear();
    this.channel.append(content);
    this.channel.show();
  }

  dispose() {
    this.channel.dispose();
  }
}

export default OutputManager.getInstance();