<template>
	<view class="my-container">
		<!-- 用户未登录时，显示登录组件 -->
		<my-login v-if="!token"></my-login>

		<!-- 用户登录后，显示用户信息组件 -->
		<my-userinfo v-else></my-userinfo>
	</view>
</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	// 1. 从 vuex 中按需导入 mapState 辅助函数
	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		mixins: [badgeMix],
		computed: {
			// 2. 从 m_user 模块中导入需要的 token 字符串
			...mapState('m_user', ['token']),
		},
		onload() {
			let token = JSON.parse(uni.getStorageSync('token') || '{}')
		},
		data() {
			return {}
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.my-container {
		height: 100%;
	}
</style>