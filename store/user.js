export default {
	// 开启命名空间
	namespaced: true,

	// state 数据
	state: () => ({
		// 3. 读取本地的收货地址数据，初始化 address 对象
		// address: JSON.parse(uni.getStorageSync('address') || '{}'),
		// address: {
		// 	"userName": "包子",
		// 	"telNumber": "13652418912",
		// 	"provinceName": "广东省",
		// 	"cityName": "深圳市",
		// 	"countyName": "坪山区",
		// 	"detailInfo": "汤坑社区坪山首座"
		// },
		address: {},
		// 登录成功之后的 token 字符串 openid 和 session_key
		token: '',
		openid: '',
		session_key: '',
		user_id: null, // 用户id
		// 用户的基本信息
		userinfo: {},
		// userinfo: {
		// 	"nickName": "包子",
		// 	"phone": "",
		// 	"gender": 0,
		// 	"language": "简体中文",
		// 	"city": "深圳",
		// 	"province": "坪山区",
		// 	"country": "汤坑街道",
		// 	"avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
		// },
		// 重定向的 object 对象 { openType, from }
		redirectInfo: null
	}),

	// 方法
	mutations: {
		saveUserToken(state, token) {
			state.token = token
		},
		saveOpenId(state, openid) {
			state.openid = openid
		},
		saveSessionKey(state, session_key) {
			state.session_key = session_key
		},
		// 请求获取收货地址
		async getAddress(state) {
			let user_id = state.user_id
			const {
				data: res
			} = await uni.$http.get('/api/address/getAddress', {
				user_id
			})
			if (res.meta.status !== 200) {
				uni.$showMsg('地址请求失败')
			}
			if (res.message != null) {
				state.address = res.message
			}
			// console.log('获取地址')
			// console.log(state.address)

		},
		// 更新收货地址
		updateAddress(state, address) {
			state.address = address
			// 2. 通过 this.commit() 方法，调用 m_user 模块下的 saveAddressToStorage 方法将 address 对象持久化存储到本地
			this.commit('m_user/saveAddressToStorage')
		},
		// 更新收货地址到数据库
		async updateAddressToDB(state, address) {
			let user_id = state.user_id
			const {
				data: res
			} = await uni.$http.post('/api/address/updataDefaultAdd', address)
			if (res.meta.status !== 200) {
				return uni.$showMsg('选择地址出错')
			}
			// 重新获取地址
			// this.getAddress()
			this.commit('m_user/getAddress')

		},
		// 1. 定义将 address 持久化存储到本地 mutations 方法
		saveAddressToStorage(state) {
			uni.setStorageSync('address', JSON.stringify(state.address))
		},
		// 更新用户的基本信息
		updateUserInfo(state, userinfo) {
			state.userinfo = userinfo
			// 通过 this.commit() 方法，调用 m_user 模块下的 saveUserInfoToStorage 方法，将 userinfo 对象持久化存储到本地
			this.commit('m_user/saveUserInfoToStorage')
		},
		// 更新用户id
		updateUserId(state, user_id) {
			state.user_id = user_id
		},
		// 将 userinfo 持久化存储到本地
		saveUserInfoToStorage(state) {
			uni.setStorageSync('userinfo', JSON.stringify(state.userinfo))
		},
		// 更新重定向的信息对象
		updateRedirectInfo(state, info) {
			state.redirectInfo = info
			// console.log(info)
			// console.log(this.redirectInfo)
		},
		// 设置用户头像
		setUserAvatar(state, avatarUrl) {
			state.userinfo.avatarUrl = avatarUrl
			// console.log("avatar = " + avatarUrl)
		},
		// 设置用户昵称
		setUserName(state, nickName) {
			state.userinfo.nickName = nickName
			// console.log("nickName = " + nickName)
		}
	},

	// 数据包装器
	getters: {
		// 收货详细地址的计算属性
		addstr(state) {
			if (!state.address.provinceName) return ''

			// 拼接 省，市，区，详细地址 的字符串并返回给用户
			return state.address.provinceName + state.address.cityName + state.address.countyName + state.address
				.detailInfo
		},
	},
}