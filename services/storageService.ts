// 存储服务 - 兼容浏览器和 Electron 环境
export class StorageService {
  private static isElectron(): boolean {
    return typeof window !== 'undefined' && 'electronAPI' in window;
  }

  // 获取日历数据
  static async getData(): Promise<any> {
    if (this.isElectron()) {
      return await window.electronAPI.storage.getData();
    } else {
      const data = localStorage.getItem('paperplan_data');
      return data ? JSON.parse(data) : {};
    }
  }

  // 保存日历数据
  static async setData(data: any): Promise<void> {
    if (this.isElectron()) {
      await window.electronAPI.storage.setData(data);
    } else {
      localStorage.setItem('paperplan_data', JSON.stringify(data));
    }
  }

  // 获取月度计划
  static async getPlans(): Promise<any> {
    if (this.isElectron()) {
      return await window.electronAPI.storage.getPlans();
    } else {
      const plans = localStorage.getItem('paperplan_plans');
      return plans ? JSON.parse(plans) : {};
    }
  }

  // 保存月度计划
  static async setPlans(plans: any): Promise<void> {
    if (this.isElectron()) {
      await window.electronAPI.storage.setPlans(plans);
    } else {
      localStorage.setItem('paperplan_plans', JSON.stringify(plans));
    }
  }
}
