<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
      <el-button
        v-loading="loading"
        type="success"
        style="margin-left: 10px"
        @click="submitForm"
      >
        {{ isEdit ? '编辑电子书' : '新增电子书' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <warning />
        <el-col :span="24">
          <ebook-upload
            :file-list="fileList"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <MdInput v-model="postForm.title" :maxlength="100" name="name" required>
              书名
            </MdInput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="author" label="作者：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.author"
                  placeholder="作者"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="publisher" label="出版社：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.publisher"
                  placeholder="出版社"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.language"
                  placeholder="语言"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="rootFile" label="根文件：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.rootFile"
                  placeholder="根文件"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="filePath" label="文件路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.filePath"
                  placeholder="文件路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unzipPath" label="解压路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.unzipPath"
                  placeholder="解压路径"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="coverPath" label="封面路径：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.coverPath"
                  placeholder="封面路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="originalName" label="文件名称：" :label-width="labelWidth">
                <el-input
                  v-model="postForm.originalName"
                  placeholder="文件名称"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="cover" label="封面：" :label-width="labelWidth">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="目录：" :label-width="labelWidth">
                <div v-if="contentsTree && contentsTree.length > 0" class="contents-wrapper">
                  <el-tree :data="contentsTree" @node-click="onContentClick" />
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Warning from './Warning'
import Sticky from '../../../components/Sticky'
import EbookUpload from '../../../components/EbookUpload'
import MdInput from '../../../components/MDinput'
import {
  createBook,
  updateBook,
  getBook
 } from '@/api/book'

// const defaultForm = {
//   title: '',
//   author: '',
//   publisher: '',
//   language: '',
//   rootFile: '',
//   cover: '',
//   url: '',
//   originalName: '',
//   fileName: '',
//   coverPath: '',
//   filePath: '',
//   unzipPath: '',
//   contents: []
// }

// 字段映射
const fields = {
  title: '书名',
  author: '作者',
  publisher: '出版社',
  language: '语种'
}

export default {
  components: { Sticky, Warning, EbookUpload, MdInput },
  props: {
    isEdit: Boolean
  },
  data() {
    // 验证必填项: rule=>字段对象名, value=>字段值, 毁掉函数
    const validateRequire = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error(`${fields[rule.field]}必须填写`))
      } else {
        callback()
      }
    }

    // 标题验证提
    const validateTitle = (rule, value, callback) => {
      if (value.length < 2) {
        callback(new Error(`${fields[rule.field]}长度必须大于1个字符`))
      } else {
        callback()
      }
    }
    return {
			loading: false,
			postForm: {},
      contentsTree: [],
      labelWidth: '120px',
      fileList: [],
      rules: {
        title: [{ validator: validateRequire }, { validator: validateTitle }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    if (this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(response => {
        this.setData(response.data)
      })
    },
    setDefault() {
      // this.postForm = Object.assign({}, defaultForm)
      this.$refs.postForm.resetFields()
      this.contentsTree = []
      this.fileList = []
      console.log('Set Default')
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        contentsTree,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data
      this.postForm = {
        ...this.postForm, // 展开原来的对象属性
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath
      }
      this.contentsTree = contentsTree
      this.fileList = [{ name: originalName || fileName, url }]
    },
    showGuide() {
      console.log('showGuide function')
    },
    submitForm() {
      // setTimeout(() => { this.loading = false }, 1000)

      const onSuccess = (response) => {
        const { msg } = response
        this.$notify({
            title: '操作成功',
            message: msg,
            type: 'success',
            duration: 2000
        })
        this.loading = false
      }

      // 表单验证
      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            // 浅拷贝
            // const book = Object.assign({}, this.postForm)
            const book = { ...this.postForm }
            // delete book.contents
            delete book.contentsTree

            // 调用接口
            if (!this.isEdit) {
              createBook(book).then(res => {
                onSuccess(res)
                this.setDefault()
              }).catch(() => {
                this.loading = false
              })
            } else {
              updateBook(book).then(res => {
                onSuccess(res)
              }).catch(() => {
                this.loading = false
              })
            }
          } else {
            const msg = fields[Object.keys(fields)[0]][0].message
            this.$message({ message: msg, type: 'error' })
            this.loading = false
          }
        })
      }
    },
    /**
     * 文件上传成功
     * @param data Object
     */
    onUploadSuccess(data) {
      this.setData(data)
    },
    onUploadRemove() {
      this.setDefault()
    },
    onContentClick(data) {
      if (data.text) {
        window.open(data.text)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .detail-container {
    padding: 40px 50px 20px;
    .preview-img {
      width: 200px;
      height: 270px;
    }
  }
</style>
