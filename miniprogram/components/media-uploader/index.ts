import Toast from 'tdesign-miniprogram/toast/index'
import { uploadFile } from '../../api/upload'

Component({
  properties: {
    src: { type: String, value: '' },
    folder: { type: String, value: 'common' },
    mediaType: { type: String, value: 'image' },
    hint: { type: String, value: '' },
    emptyText: { type: String, value: '点击上传' },
  },

  data: {
    uploading: false,
  },

  methods: {
    onPick() {
      if (this.data.uploading) return
      const isVideo = this.data.mediaType === 'video'
      wx.chooseMedia({
        count: 1,
        mediaType: [isVideo ? 'video' : 'image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const path = res.tempFiles[0]?.tempFilePath
          if (!path) return
          this.setData({ uploading: true })
          uploadFile(path, this.data.folder)
            .then((url) => {
              this.setData({ uploading: false })
              this.triggerEvent('change', { value: url })
            })
            .catch(() => {
              this.setData({ uploading: false })
              Toast({ context: this, selector: '#t-toast', message: '上传失败', theme: 'error' })
            })
        },
      })
    },

    onClear() {
      this.triggerEvent('change', { value: '' })
    },
  },
})
