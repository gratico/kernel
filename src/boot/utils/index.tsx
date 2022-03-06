import { IKernel, IDoc, IFileSystem } from '../../specs'
import crawl from 'tree-crawl'
import pify from 'pify'
import { path } from '@gratico/fs'
import { getAncestors } from '@gratico/bodhi'

export async function crawlAndPerform(list: IDoc[], action: (doc: IDoc) => void) {
	console.log(list)
	const root = list.find((el) => el.parentId == null) as IDoc
	const jobs: IDoc[] = []
	crawl<IDoc>(
		root,
		(node) => {
			console.log(node.name)
			jobs.push(node)
		},
		{
			getChildren: (node) => {
				const kids = list.filter((el) => el.parentId == node._id)
				console.log(node, kids)
				return kids
			},
		},
	)
	console.log('jobs', jobs)
	for (const job of jobs) {
		console.log(job)
		await action(job)
	}
}

export async function loadFilesystem(projectId: string, fs: IFileSystem) {
	const dbTokenRequest = await fetch('/hq/api/v1/kernel/database_tokens/new')
	const dbToken = (await dbTokenRequest.json()) as { jwt: string }

	const docsRequest = await fetch(`https://couch.www.grati.co/project-${projectId}/_all_docs?include_docs=true`, {
		headers: {
			Authorization: `Bearer ${dbToken.jwt}`,
		},
	})
	const docsResp = await docsRequest.json()
	console.log(docsResp)
	const fsDocs = docsResp.rows.filter((r: any) => r.doc['type'] == 'filesystem').map((r: any) => r.doc)
	console.log(fsDocs)
	await crawlAndPerform(fsDocs, async (doc) => {
		console.log(doc)
		const ancestors = getAncestors(fsDocs, doc._id)
		console.log('ancestors', ancestors)
		const basePath = ['/', ...ancestors.reverse().map((el) => el.name)].join('/')
		console.log('basePath', basePath)
		const filepath = path.join(basePath, doc.name)
		console.log(filepath)
		try {
			if (doc.payload) {
				await pify(fs.writeFile)(filepath, JSON.stringify(doc.payload))
			} else {
				await pify(fs.mkdir)(filepath)
			}
		} catch (e) {
			console.error(e, filepath)
		}
	})
	console.log(fsDocs)
}

export function bootRuntime() {}
