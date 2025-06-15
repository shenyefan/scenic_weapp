import { getLoginUser, updateMyUser, userLogout } from '../../api/userController'
import Notify from '@vant/weapp/notify/notify'
import { uploadFile } from '../../utils/file'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      id: null,
      userName: '',
      userAccount: '',
      userAvatar: '',
      userProfile: '',
      userRole: ''
    },
    // 是否已登录
    isLoggedIn: false,
    // 弹窗显示状态
    showProfilePopup: false,
    showUsernamePopup: false,
    showPasswordPopup: false,
    // 表单数据
    newProfile: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    // 更新状态
    updating: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init();
    // 页面显示时也检查登录状态，确保从登录页返回后能更新状态
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        this.setData({
          isLoggedIn: false,
          userInfo: {
            id: null,
            userName: '未登录',
            userAccount: '',
            userAvatar: '', // 可以设置一个默认未登录头像
            userProfile: '',
            userRole: ''
          }
        })
        return
      }

      const res = await getLoginUser()
      if (res.code === 200 && res.data) {
        this.setData({
          isLoggedIn: true,
          userInfo: res.data
        })
      } else {
        wx.removeStorageSync('token')
        this.setData({
          isLoggedIn: false,
          userInfo: {
            id: null,
            userName: '未登录',
            userAccount: '',
            userAvatar: '',
            userProfile: '',
            userRole: ''
          }
        })
        // 可以选择性提示用户登录已过期
        // Notify({ type: 'warning', message: '登录已过期，请重新登录' });
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      wx.removeStorageSync('token')
      this.setData({
        isLoggedIn: false,
        userInfo: {
          id: null,
          userName: '未登录',
          userAccount: '',
          userAvatar: '',
          userProfile: '',
          userRole: ''
        }
      })
      Notify({ type: 'danger', message: '检查登录状态失败，请稍后重试' })
    }
  },

  /**
   * 获取角色显示名称
   */
  getRoleDisplayName(role: string) {
    const roleMap: { [key: string]: string } = {
      'admin': '管理员',
      'user': '普通用户',
      'inspector': '巡检员'
    }
    return roleMap[role] || '未知角色'
  },

  /**
   * 修改头像
   */
  changeAvatar() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' });
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        Notify({ type: 'primary', message: '上传中...', duration: 0 }); // 使用 Notify 显示加载状态
        
        try {
          const response = await uploadFile({
            filePath: tempFilePath,
            biz: 'user_avatar'
          });

          Notify.clear(); // 清除加载提示

          if (response && response.code === 200) {
            const avatarUrl = response.data;
            this.setData({
              'userInfo.userAvatar': avatarUrl
            });
            
            const updateRes = await updateMyUser({
              userAvatar: avatarUrl
            });

            if (updateRes && updateRes.code === 200) {
              Notify({ type: 'success', message: '头像更新成功' });
            } else {
              Notify({ type: 'danger', message: updateRes.message || '更新用户信息失败' });
            }
          } else {
            Notify({ type: 'danger', message: response.message || '上传失败' });
          }
        } catch (error: any) {
          Notify.clear(); // 清除加载提示
          console.error('上传头像流程出错:', error);
          Notify({ type: 'danger', message: error.message || '上传异常' });
        }
      },
      fail: (err) => {
        console.log('用户取消选择图片', err);
        // 可选：如果用户取消，也可以给一个轻提示
        // Notify({ type: 'warning', message: '已取消选择' }); 
      }
    });
  },

  /**
   * 编辑个人简介
   */
  editProfile() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' })
      return
    }
    this.setData({
      showProfilePopup: true,
      newProfile: this.data.userInfo.userProfile || ''
    })
  },

  /**
   * 个人简介输入变化
   */
  onProfileChange(event: any) {
    this.setData({
      newProfile: event.detail
    })
  },

  /**
   * 关闭个人简介弹窗
   */
  closeProfilePopup() {
    this.setData({
      showProfilePopup: false,
      newProfile: '' // 清空输入内容
    })
  },

  /**
   * 确认修改个人简介
   */
  async confirmProfile() {
    if (this.data.updating) return

    this.setData({ updating: true })
    try {
      const res = await updateMyUser({
        userProfile: this.data.newProfile
      })

      if (res.code === 200) {
        this.setData({
          'userInfo.userProfile': this.data.newProfile,
          showProfilePopup: false
        })
        Notify({ type: 'success', message: '个人简介更新成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '更新失败' })
      }
    } catch (error: any) {
      console.error('更新个人简介失败:', error)
      Notify({ type: 'danger', message: error.message || '更新失败' })
    } finally {
      this.setData({ updating: false })
    }
  },

  /**
   * 编辑昵称
   */
  editUsername() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' })
      return
    }
    this.setData({
      showUsernamePopup: true,
      newUsername: this.data.userInfo.userName || ''
    })
  },

  /**
   * 昵称输入变化
   */
  onUsernameChange(event: any) {
    this.setData({
      newUsername: event.detail
    })
  },

  /**
   * 关闭昵称弹窗
   */
  closeUsernamePopup() {
    this.setData({
      showUsernamePopup: false,
      newUsername: '' // 清空输入内容
    })
  },

  /**
   * 确认修改昵称
   */
  async confirmUsername() {
    if (this.data.updating) return
    if (!this.data.newUsername.trim()) {
      Notify({ type: 'warning', message: '昵称不能为空' })
      return
    }

    this.setData({ updating: true })
    try {
      const res = await updateMyUser({
        userName: this.data.newUsername
      })

      if (res.code === 200) {
        this.setData({
          'userInfo.userName': this.data.newUsername,
          showUsernamePopup: false
        })
        Notify({ type: 'success', message: '昵称更新成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '更新失败' })
      }
    } catch (error: any) {
      console.error('更新昵称失败:', error)
      Notify({ type: 'danger', message: error.message || '更新失败' })
    } finally {
      this.setData({ updating: false })
    }
  },

  /**
   * 修改密码
   */
  changePassword() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' })
      return
    }
    this.setData({
      showPasswordPopup: true,
      newPassword: '',
      confirmPassword: ''
    })
  },

  /**
   * 新密码输入变化
   */
  onNewPasswordChange(event: any) {
    this.setData({
      newPassword: event.detail
    })
  },

  /**
   * 确认密码输入变化
   */
  onConfirmPasswordChange(event: any) {
    this.setData({
      confirmPassword: event.detail
    })
  },

  /**
   * 关闭密码弹窗
   */
  closePasswordPopup() {
    this.setData({
      showPasswordPopup: false,
      newPassword: '',
      confirmPassword: '' // 清空输入内容
    })
  },

  /**
   * 确认修改密码
   */
  async confirmPassword() {
    if (this.data.updating) return
    
    if (!this.data.newPassword.trim()) {
      Notify({ type: 'warning', message: '新密码不能为空' })
      return
    }
    
    if (this.data.newPassword.length < 6) {
      Notify({ type: 'warning', message: '密码长度不能少于6位' })
      return
    }
    
    if (this.data.newPassword !== this.data.confirmPassword) {
      Notify({ type: 'warning', message: '两次输入的密码不一致' })
      return
    }

    this.setData({ updating: true })
    try {
      const res = await updateMyUser({
        userPassword: this.data.newPassword
      })

      if (res.code === 200) {
        this.setData({
          showPasswordPopup: false,
          newPassword: '',
          confirmPassword: ''
        })
        Notify({ type: 'success', message: '密码更新成功' })
      } else {
        Notify({ type: 'danger', message: res.message || '更新失败' })
      }
    } catch (error: any) {
      console.error('更新密码失败:', error)
      Notify({ type: 'danger', message: error.message || '更新失败' })
    } finally {
      this.setData({ updating: false })
    }
  },

  /**
   * 关于系统
   */
  aboutSystem() {
    // 关于系统信息，使用 wx.showModal 可能更合适，因为它通常包含较多文本且不需要用户立即操作
    // 如果坚持使用 Notify，可以分多条显示或只显示核心信息
    wx.showModal({
      title: '关于系统',
      content: '景区管理系统 v1.0\n\n功能包括：\n- 景点管理\n- 路线规划\n- 任务管理\n- 用户管理',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 处理登录/退出登录
   */
  handleLoginLogout() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await userLogout()
            wx.removeStorageSync('token')
            this.setData({
              isLoggedIn: false,
              userInfo: {
                id: null,
                userName: '未登录',
                userAccount: '',
                userAvatar: '',
                userProfile: '',
                userRole: ''
              }
            })
            Notify({ type: 'success', message: '已退出登录' })
          } catch (error: any) {
            console.error('退出登录失败:', error)
            wx.removeStorageSync('token')
            this.setData({
              isLoggedIn: false,
              userInfo: {
                id: null,
                userName: '未登录',
                userAccount: '',
                userAvatar: '',
                userProfile: '',
                userRole: ''
              }
            })
            // 即便接口失败，也提示用户已在本地登出
            Notify({ type: 'success', message: '已在本地退出登录' })
          }
        } else {
          Notify({ type: 'warning', message: '已取消' });
        }
      }
    })
  }
})