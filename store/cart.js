export default {
	// 为当前模块开启命名空间
	namespaced: true,

	// 模块的 state 数据
	state: () => ({
		// 购物车的数组，用来存储购物车中每个商品的信息对象
		// 每个商品的信息对象，都包含如下 6 个属性：
		// { goods_id, goods_name, goods_price, goods_count, goods_small_logo, goods_state }
		// cart: JSON.parse(uni.getStorageSync('cart') || '[]'),
		cart: [],
	}),

	// 模块的 mutations 方法
	// state的数据只能被mutations修改
	mutations: {
		addToCart(state, goods) {
			// 根据提交的商品的Id，查询购物车中是否存在这件商品
			// 如果不存在，则 findResult 为 undefined；否则，为查找到的商品信息对象
			const findResult = state.cart.find((x) => x.goods_id === goods.goods_id)


			if (!findResult) {
				// 如果购物车中没有这件商品，则直接 push
				state.cart.push(goods)
			} else {
				// 如果购物车中有这件商品，则只更新数量即可
				findResult.goods_count++
			}
			// console.log(state.cart)
			// 通过 commit 方法，调用 m_cart 命名空间下的 saveToStorage 方法
			this.commit('m_cart/saveToStorage')
			// todo 调用函数，添加商品到购物车数据库
		},
		// 将购物车中的数据持久化存储到本地
		saveToStorage(state) {
			uni.setStorageSync('cart', JSON.stringify(state.cart))
		},
		// 更新购物车中商品的勾选状态
		updateGoodsState(state, goods) {
			// 根据 goods_id 查询购物车中对应商品的信息对象
			const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

			// 有对应的商品信息对象
			if (findResult) {
				// 更新对应商品的勾选状态
				findResult.goods_state = goods.goods_state
				// 持久化存储到本地
				this.commit('m_cart/saveToStorage')
				console.log("购物车信息已保存")
			}
		},
		// 更新购物车中商品的数量
		updateGoodsCount(state, goods) {
			// 根据 goods_id 查询购物车中对应商品的信息对象
			const findResult = state.cart.find(x => x.goods_id === goods.goods_id)

			// 有对应的商品信息对象
			if (findResult) {
				// 更新对应商品的数量
				findResult.goods_count = goods.goods_count
				// 持久化存储到本地
				this.commit('m_cart/saveToStorage')
				console.log("购物车信息已保存")
			}
		},
		// 根据 Id 从购物车中删除对应的商品信息
		removeGoodsById(state, goods_id) {
			// 调用数组的 filter 方法进行过滤
			state.cart = state.cart.filter(x => x.goods_id !== goods_id)
			// 持久化存储到本地
			this.commit('m_cart/saveToStorage')
		},
		// 更新所有商品的勾选状态
		async updateAllGoodsState(state, params) {
			// // 循环更新购物车中每件商品的勾选状态
			// state.cart.forEach(x => x.goods_state = newState)
			// // 持久化存储到本地
			// this.commit('m_cart/saveToStorage')
			// console.log(params)
			let user_id = params.user_id
			let newState = params.newState
			const {
				data: res
			} = await uni.$http.get('/api/cart/updateAllGoodsState', {
				user_id,
				newState
			})
			if (res.meta.status !== 200) {
				return uni.$showMsg("更新所有商品的勾选状态失败！")
			}
			// 重新获取购物车信息
			this.commit('m_cart/getCartList', {
				user_id: user_id
			})
		},
		// 更新购物车数据
		updateCartInfo(state, cartList) {
			state.cart = cartList
		},
		// 发请求获取购物车信息
		async getCartList(state, params) {
			let user_id = params.user_id
			const {
				data: res
			} = await uni.$http.get('/api/cart/getCartList', {
				user_id
			})

			if (res.meta.status !== 200) {
				return uni.$showMsg('获取购物车信息失败')
			}
			this.commit('m_cart/updateCartInfo', res.message)
		}
	},

	// 模块的 getters 属性
	getters: {
		// 统计购物车中商品的总数量
		total(state) {
			let c = 0
			// 循环统计商品的数量，累加到变量 c 中
			state.cart.forEach(goods => c += goods.goods_count)
			return c
		},
		// 勾选的商品的总数量
		checkedCount(state) {
			// 先使用 filter 方法，从购物车中过滤器已勾选的商品
			// 再使用 reduce 方法，将已勾选的商品总数量进行累加
			// reduce() 的返回值就是已勾选的商品的总数量
			return state.cart.filter(x => x.goods_state).reduce((total, item) => total += item.goods_count, 0)
		},
		// 已勾选的商品的总价
		checkedGoodsAmount(state) {
			// 先使用 filter 方法，从购物车中过滤器已勾选的商品
			// 再使用 reduce 方法，将已勾选的商品数量 * 单价之后，进行累加
			// reduce() 的返回值就是已勾选的商品的总价
			// 最后调用 toFixed(2) 方法，保留两位小数
			return state.cart.filter(x => x.goods_state)
				.reduce((total, item) => total += item.goods_count * item.goods_price, 0)
				.toFixed(2)
		}
	},
}