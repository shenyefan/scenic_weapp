Component({
  data: {
    value: '', // 初始值设置为空，避免第一次加载时闪烁
    list: [
      {
        icon: 'home',
        value: 'home',
        label: '首页',
      },
      {
        icon: 'robot-1',
        value: 'guide',
        label: '智慧导览',
      },
      {
        icon: 'app',
        value: 'workbench',
        label: '工作台',
      },
      {
        icon: 'user',
        value: 'user',
        label: '我的',
      },
    ],
  },
  lifetimes: {
    ready() {
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      if (curPage) {
        const nameRe = /pages\/(\w+)\/index/.exec(curPage.route);
        if (nameRe === null) return;
        if (nameRe[1] && nameRe) {
          this.setData({
            value: nameRe[1],
          });
        }
      }
    },
  },
  methods: {
    handleChange(e: { detail: { value: any; }; }) {
      const { value } = e.detail;
      wx.switchTab({ url: `/pages/${value}/index` });
    },
  },
});
