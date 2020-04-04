import { IBlessedDispConfig } from './dashboardTypes';

export class DispConfigManager {
  options: IBlessedDispConfig[] = [
    { fg: 'magenta', bold: true },
    { fg: 'cyan', bold: true },
    { fg: 'yellow', bold: true },
    { fg: 'white', bold: true },
    { fg: 'green', bold: true },
    { fg: 'blue', bold: true },
    { fg: 'magenta', bold: false },
    { fg: 'cyan', bold: false },
    { fg: 'yellow', bold: false },
    { fg: 'white', bold: false },
    { fg: 'green', bold: false },
    { fg: 'blue', bold: false },
  ];
  registry: { [name: string]: IBlessedDispConfig } = {};
  index: number = 0;

  get(name: string) {
    if (!name) {
      return {
        fg: 'black',
        bold: true,
      };
    }
    const reg = this.registry[name];
    if (reg) {
      return reg;
    }
    const newReg = this.options[this.index];
    this.index = (this.index + 1) % this.options.length;
    this.registry[name] = newReg;
    return newReg;
  }
}

export const dispConfigManager = new DispConfigManager();
