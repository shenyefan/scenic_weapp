import { getLoginUser, updateMyUser } from '../../../api/userController'
import { uploadFile } from '../../../utils/file'
import Notify from '@vant/weapp/notify/notify'

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
      userRole: '',
      userPhone: '',
      userEmail: ''
    },
    // 是否已登录
    isLoggedIn: false,
    // 编辑状态
    isEditing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        this.setData({
          isLoggedIn: false
        })
        return
      }

      const res = await getLoginUser()
      if (res.code === 200 && res.data) {
        this.setData({
          isLoggedIn: true,
          userInfo: {
            ...res.data,
            userPhone: res.data.userPhone || '',
            userEmail: res.data.userEmail || ''
          },
          avatarUrl: res.data.userAvatar
        })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      Notify({ type: 'danger', message: '加载用户信息失败' })
    }
  },

  /**
   * 选择头像回调
   */
  async onChooseAvatar(e: any) {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' });
      return;
    }

    const { avatarUrl } = e.detail;
    
    // 先更新本地显示
    this.setData({
      avatarUrl
    });
    
    Notify({ type: 'primary', message: '上传中...', duration: 0 });
    
    try {
      const response = await uploadFile({
        filePath: avatarUrl,
        biz: 'user_avatar'
      });
      if (response && response.code === 200) {
        const uploadedAvatarUrl = response.data;
        
        // 更新用户信息
        const updateRes = await updateMyUser({
          userAvatar: uploadedAvatarUrl
        });

        if (updateRes && updateRes.code === 200) {
          this.setData({
            'userInfo.userAvatar': uploadedAvatarUrl,
            avatarUrl: uploadedAvatarUrl
          });
          Notify.clear();
          Notify({ type: 'success', message: '头像更新成功' });
        } else {
          // 如果更新失败，恢复原头像
          this.setData({
            avatarUrl: this.data.userInfo.userAvatar
          });
          Notify({ type: 'danger', message: updateRes.message || '更新用户信息失败' });
        }
      } else {
        // 如果上传失败，恢复原头像
        this.setData({
          avatarUrl: this.data.userInfo.userAvatar
        });
        Notify({ type: 'danger', message: response.message || '上传失败' });
      }
    } catch (error: any) {
      Notify.clear();
      // 如果出错，恢复原头像
      this.setData({
        avatarUrl: this.data.userInfo.userAvatar
      });
      console.error('上传头像流程出错:', error);
      Notify({ type: 'danger', message: error.message || '上传异常' });
    }
  },
  
  /**
   * 获取手机号
   */
  onGetPhoneNumber() {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' });
      return;
    }
    // 这里可以实现获取手机号的逻辑
    Notify({ type: 'primary', message: '获取手机号功能待实现' });
  },

  /**
   * 表单提交处理
   */
  async onFormSubmit(event: any) {
    if (!this.data.isLoggedIn) {
      Notify({ type: 'warning', message: '请先登录' });
      return;
    }
    
    const formData = event.detail.value;
    
    try {
      Notify({ type: 'primary', message: '保存中...', duration: 0 });
      
      const res = await updateMyUser({
        userName: formData.userName || this.data.userInfo.userName,
        userPhone: formData.userPhone || this.data.userInfo.userPhone,
        userEmail: formData.userEmail || this.data.userInfo.userEmail,
        userProfile: formData.userProfile || this.data.userInfo.userProfile
      });
      
      wx.hideLoading();
      
      if (res.code === 200) {
        // 更新本地数据
        this.setData({
          'userInfo.userName': formData.userName || this.data.userInfo.userName,
          'userInfo.userPhone': formData.userPhone || this.data.userInfo.userPhone,
          'userInfo.userEmail': formData.userEmail || this.data.userInfo.userEmail,
          'userInfo.userProfile': formData.userProfile || this.data.userInfo.userProfile
        });
        
        Notify({ type: 'success', message: '保存成功' });
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      } else {
        Notify({ type: 'danger', message: res.message || '保存失败' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('保存用户信息失败:', error);
      Notify({ type: 'danger', message: '保存失败' });
    }
  },

  /**
   * 用户名输入变化
   */
  onUserNameChange(event: any) {
    this.setData({
      'userInfo.userName': event.detail
    })
  },

  /**
   * 手机号输入变化
   */
  onPhoneChange(event: any) {
    this.setData({
      'userInfo.userPhone': event.detail
    })
  },

  /**
   * 邮箱输入变化
   */
  onEmailChange(event: any) {
    this.setData({
      'userInfo.userEmail': event.detail
    })
  }
})