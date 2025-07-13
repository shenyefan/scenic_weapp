Component({
	data: {
		active: 0,
		list: [
			{
				icon: 'wap-home',
				text: '主页',
				url: '/pages/home/index'
      },
      {
				icon: 'map-marked',
				text: '智慧导览',
				url: '/pages/guide/index'
			},
      {
				icon: 'todo-list',
				text: '工作台',
				url: '/pages/manage/index'
			},
			{
				icon: 'user',
				text: '我的',
				url: '/pages/user/index'
			}
		]
	},

	methods: {
		onChange(event) {
			this.setData({ active: event.detail });
			wx.switchTab({
				url: this.data.list[event.detail].url
			});
		},

		init() {
			const page = getCurrentPages().pop();
			this.setData({
				active: this.data.list.findIndex(item => item.url === `/${page.route}`)
			});
		}
	}
});
