<template>
	<view class="login-container">
		<!-- 提示登录的图标 -->
		<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
		<!-- 登录按钮 -->
		<!-- 可以从 @getuserinfo 事件处理函数的形参中，获取到用户的基本信息 -->
		<view class="phone-box">
			<input v-model="phone" focus placeholder="请输入手机号" />
		</view>
		<button type="primary" class="btn-login" open-type="getUserInfo" @getuserinfo="getUserInfo">一键登录</button>
		<!-- 登录提示 -->
		<view class="tips-text">登录后尽享更多权益</view>
	</view>
</template>
<script>
	// 1. 按需导入 mapMutations 辅助函数
	import {
		mapMutations,
		mapState
	} from 'vuex'

	export default {
		computed: {
			// 调用 mapState 辅助方法，把 m_user 模块中的数据映射到当前用组件中使用
			...mapState('m_user', ['redirectInfo', 'userinfo', 'user_id'])
		},
		data() {
			return {
				phone: ""
			}
		},
		methods: {
			// 调用 mapMutations 辅助方法，把 m_user 模块中的方法映射到当前组件中使用
			...mapMutations('m_user', ['updateUserInfo', 'updateToken', 'updateRedirectInfo', 'updateUserId']),
			...mapMutations('m_user', ['saveUserToken', 'saveOpenId', 'saveSessionKey']),

			// 获取微信用户的基本信息
			getUserInfo(e) {
				// 判断是否获取用户信息成功
				if (e.detail.errMsg === 'getUserInfo:fail auth deny') return uni.$showMsg('您取消了登录授权！')

				// userInfo增加手机号
				e.detail.userInfo.phone = this.phone
				// 获取用户信息成功， e.detail.userInfo 就是用户的基本信息
				// console.log(e.detail.userInfo)
				// 3. 将用户的基本信息存储到 vuex 中
				this.updateUserInfo(e.detail.userInfo)
				// 获取登录成功后的 Token 字符串
				this.getToken(e.detail)
			},
			// 调用登录接口，换取永久的 token
			async getToken(info) {
				// console.log(info)
				// 调用微信登录接口
				const [err, res] = await uni.login().catch(err => err)
				// 判断是否 uni.login() 调用失败
				if (err || res.errMsg !== 'login:ok') return uni.$showError('登录失败！')

				// 准备参数对象
				const query = {
					code: res.code,
					encryptedData: info.encryptedData,
					iv: info.iv,
					rawData: this.userinfo, // rawData: info.rawData
					user_id: this.user_id,
					signature: info.signature
				}

				// 换取 token
				// const {
				// 	data: token
				// } = await uni.$http.get('/api/my/login')

				// 换取 token
				const {
					data: loginResult
				} = await uni.$http.post('/api/my/wxlogin', query)

				// console.log("token = " + loginResult.message.token)

				if (loginResult.meta.status !== 200) return uni.$showMsg('登录失败！')
				if (loginResult.message.token == "") {
					uni.$showMsg('登录失败token为空')
				}

				// 2. 更新 vuex 中的 token
				// this.updateToken(loginResult.message.token)
				this.saveUserToken(loginResult.message.token)
				this.saveOpenId(loginResult.message.openid)
				this.saveSessionKey(loginResult.message.session_key)
				this.updateUserInfo(loginResult.message.userinfo) // 获取用户上次登录的信息
				this.updateUserId(loginResult.message.user_id)
				uni.$showMsg('登录成功')

				// 判断 vuex 中的 redirectInfo 是否为 null
				// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
				this.navigateBack()
			},
			// 返回登录之前的页面
			navigateBack() {
				// console.log("进入navigateBack")
				// console.log(this.redirectInfo)
				// redirectInfo 不为 null，并且导航方式为 switchTab
				if (this.redirectInfo && this.redirectInfo.openType === 'switchTab') {
					console.log("登陆成功，准备调回去")
					// 调用小程序提供的 uni.switchTab() API 进行页面的导航
					uni.switchTab({
						// 要导航到的页面地址
						url: this.redirectInfo.from,
						// 导航成功之后，把 vuex 中的 redirectInfo 对象重置为 null
						complete: () => {
							console.log("complete")
							this.updateRedirectInfo(null)
						}
					})
				}
				if (this.redirectInfo && this.redirectInfo.openType === 'navigateTo') {
					console.log("登陆成功，准备调回去")
					// 调用小程序提供的 uni.switchTab() API 进行页面的导航
					uni.navigateTo({
						// 要导航到的页面地址
						url: this.redirectInfo.from,
						// 导航成功之后，把 vuex 中的 redirectInfo 对象重置为 null
						complete: () => {
							console.log("complete")
							this.updateRedirectInfo(null)
						}
					})
				}
			}
		}
	}
</script>
<style lang='scss'>
	.login-container {
		/* 登录盒子的样式 */
		height: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
		position: relative;
		overflow: hidden;

		/* 绘制登录盒子底部的半椭圆造型 */
		&::after {
			content: ' ';
			display: block;
			position: absolute;
			width: 100%;
			height: 40px;
			left: 0;
			bottom: 0;
			background-color: white;
			border-radius: 100%;
			transform: translateY(50%);
		}

		/* 登录按钮的样式 */
		.btn-login {
			width: 90%;
			border-radius: 100px;
			margin: 15px 0;
			background-color: #1AAD19;
		}

		/* 按钮下方提示消息的样式 */
		.tips-text {
			font-size: 16px;
			color: gray;
		}

		.phone-box {
			border-radius: 100px;
			border: 1px solid burlywood;
			font-size: 20px;
			width: 88%;
			height: 40px;
			margin: 5px 0;
		}
	}
</style>