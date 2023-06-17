import { ipcMain } from 'electron'
import { getLink } from './getLink'
import { validate } from './validate'
import { batchApplication } from './batchApplication'
import { chunk } from 'lodash'
import { sleep } from '../tools'

const parseAccount = text => text.split('\n').filter(Boolean).map(v => {
	v = v.split(/(——|-)+/).filter(v => !['-', '——'].includes(v))
	return v
})

ipcMain.handle('gpt-link', async (event, arg) => {
  const { text } = arg
	// 进程数
	const processNum = 2
	const totalArr = parseAccount(text)
	const accounts = chunk(totalArr, Math.ceil(totalArr.length / processNum))

	async function run (accounts) {
		for(let i = 0; i < accounts.length; i++) {
			const [user, pass] = accounts[i]
			const link = await getLink({ user, pass, index: i, id: user, ...arg })
			console.log('process', i, user, link)
		}	
	}
	const links = []
	for(let i = 0; i < accounts.length; i++) {
		if (i !== 0) await sleep(2000)
		run(accounts[i])
	}
})

ipcMain.handle('gpt-result', async (event, arg) => {
	const { text } = arg
	const accounts = parseAccount(text)

	const links = []
	for(let i = 0; i < accounts.length; i++) {
		const [user, pass] = accounts[i]
		const link = await validate({ user, pass, index: i, id: user })
		links.push({
			i,
			user,
			link
		})
		console.log('process', i, user, link)
	}
	// browser && browser.close()
})


ipcMain.handle('gpt-batch-4.0', async (event, arg) => {
	const { text } = arg
	const accounts = parseAccount(text)

	const links = []
	for(let i = 0; i < accounts.length; i++) {
		const [user, pass] = accounts[i]
		const link = await batchApplication({ user, pass, index: i, id: user })
		links.push({
			i,
			user,
			link
		})
		console.log('process', i, user, link)
	}
	// browsers.forEach(browser => browser.close())
})


const actions = {
	'gpt-link': getLink,
	'gpt-result': validate,
	'gpt-batch-4.0': batchApplication
}

export async function runActions(action: keyof typeof actions, options: any) {
	const { text } = options
	const accounts = parseAccount(text)

	const links = []
	for(let i = 0; i < accounts.length; i++) {
		const [user, pass] = accounts[i]
		const link = await batchApplication({ user, pass, index: i, id: user })
		links.push({
			i,
			user,
			link
		})
		console.log('process', i, user, link)
	}
}