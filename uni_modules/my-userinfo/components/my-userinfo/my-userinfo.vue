<template>
	<view class="my-userinfo-container">

		<!-- 头像昵称区域 -->
		<view class="top-box">
			<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image :src="userinfo.avatarUrl" class="avatar"></image>
			</button>
			<view class="nickname">
				<input type="nickname" class="weui-input" :value="nickName" @blur="bindblur"
					:placeholder="userinfo.nickName" @input="bindinput" />
			</view>
		</view>

		<!-- 面板的列表区域 -->
		<view class="panel-list">
			<!-- 第一个面板 -->
			<view class="panel">
				<!-- panel 的主体区域 -->
				<view class="panel-body">
					<!-- panel 的 item 项 -->
					<view class="panel-item">
						<text>8</text>
						<text>收藏的店铺</text>
					</view>
					<view class="panel-item">
						<text>14</text>
						<text>收藏的商品</text>
					</view>
					<view class="panel-item">
						<text>18</text>
						<text>关注的商品</text>
					</view>
					<view class="panel-item">
						<text>84</text>
						<text>足迹</text>
					</view>
				</view>
			</view>

			<!-- 第二个面板 -->
			<view class="panel">
				<!-- 面板的标题 -->
				<view class="panel-title">我的订单</view>
				<!-- 面板的主体 -->
				<view class="panel-body">
					<!-- 面板主体中的 item 项 -->
					<view class="panel-item">
						<image src="/static//代付款.png" class="icon"></image>
						<text>待付款</text>
					</view>
					<view class="panel-item">
						<image src="/static//代收货.png" class="icon"></image>
						<text>待收货</text>
					</view>
					<view class="panel-item">
						<image src="/static//退款.png" class="icon"></image>
						<text>退款/退货</text>
					</view>
					<view class="panel-item">
						<image src="/static//全部订单.png" class="icon"></image>
						<text>全部订单</text>
					</view>
				</view>
			</view>

			<!-- 第三个面板 -->
			<view class="panel">
				<view class="panel-list-item">
					<text>收货地址</text>
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
				<view class="panel-list-item">
					<text>联系客服</text>
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
				<view class="panel-list-item" @click="logout">
					<text>退出登录</text>
					<uni-icons type="arrowright" size="15"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	// 按需导入辅助函数
	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		computed: {
			...mapState('m_user', ['userinfo']),
		},
		data() {
			return {}
		},
		methods: {
			...mapMutations('m_user', ['updateUserInfo', 'updateAddress', 'setUserAvatar', 'setUserName']),
			...mapMutations('m_user', ['saveOpenId', 'saveSessionKey', 'saveUserToken']),
			...mapMutations('m_cart', ['updateCartInfo']),
			// 退出登录
			async logout() {
				// 询问用户是否退出登录
				const [err, succ] = await uni.showModal({
					title: '提示',
					content: '确认退出登录吗？'
				}).catch(err => err)

				if (succ && succ.confirm) {
					// 用户确认了退出登录的操作
					// 需要清空 vuex 中的 userinfo、token 和 address
					this.updateUserInfo({})
					this.saveUserToken('')
					this.updateAddress({})
					this.saveOpenId('')
					this.saveSessionKey('')
					this.updateCartInfo([]) // 更新前端的购物车列表
				}
			},
			async onChooseAvatar(e) {

				let avatarUrl = e.detail.avatarUrl
				this.setUserAvatar(avatarUrl)

				const {
					data: res
				} = await uni.$http.post('/api/my/saveUserAvatar', avatarUrl)

				if (res.meta.status !== 200) {
					return uni.showMsg('微信头像存储失败')
				}

			},
			async bindblur(e) {
				let nickName = e.detail.value
				this.setUserName(nickName)
				if (nickName === '') {
					nickName = '佚名'
				}
				const {
					data: res
				} = await uni.$http.post('/api/my/saveNickName', nickName)

				if (res.meta.status !== 200) {
					return uni.showMsg('微信昵称存储失败')
				}
			}

		}
	}
</script>
<style lang='scss'>
	.my-userinfo-container {
		height: 100%;
		/* 为整个组件的结构添加浅灰色的背景 */
		background-color: #f4f4f4;

		.top-box {
			height: 400rpx;
			/* background-color: #c00000; */
			background-color: #1296db;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;


			.avatar-wrapper {
				/* 				padding: 0;
				width: 56px !important;
				border-radius: 8px;
				margin-top: 40px;
				margin-bottom: 40px;
				background-color: #fff; */
				display: block;
				width: 90px;
				height: 90px;
				border-radius: 45px;
				border: 2px solid white;
				box-shadow: 0 1px 5px black;

				.avatar {
					display: block;
					width: 90px;
					height: 90px;
					border-radius: 45px;
					/* border: 2px solid white; */
					/* box-shadow: 0 1px 5px black; */

				}
			}

			.nickname {
				color: white;
				font-weight: bold;
				font-size: 16px;
				margin-top: 10px;
				margin-left: 175px;
			}
		}
	}

	.panel-list {
		padding: 0 10px;
		position: relative;
		top: -10px;

		.panel {
			background-color: white;
			border-radius: 3px;
			margin-bottom: 8px;

			.panel-title {
				line-height: 45px;
				padding-left: 10px;
				font-size: 15px;
				border-bottom: 1px solid #f4f4f4;
			}

			.panel-body {
				display: flex;
				justify-content: space-around;

				.panel-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: space-around;
					font-size: 13px;
					padding: 10px 0;
				}

				.icon {
					width: 35px;
					height: 35px;
				}
			}
		}
	}

	.panel-list-item {
		height: 45px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 15px;
		padding: 0 10px;
	}
</style>