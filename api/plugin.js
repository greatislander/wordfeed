const fetch = require('node-fetch');

import {Feed} from 'feed';

module.exports = async (request, response) => {
	const {slug} = request.query;
	const endpoint = `https://api.wordpress.org/plugins/info/1.0/${slug}.json`;
	const data = await fetch(endpoint);
	const json = await data.json();
	if (data.status === 404) {
		response.status(200).send('The plugin could not be found');
	} else {
		const feed = new Feed({
			title: `${json.name} Updates`,
			description: `Unofficial update feed for ${json.name}.`,
			id: `https://wordfeed.now.sh/plugins/${slug}`,
			link: `https://wordfeed.now.sh/plugins/${slug}`,
			generator: 'Wordfeed',
			author: {
				name: 'Ned Zimmerman',
				email: 'ned@bight.dev',
				link: 'https://bight.dev'
			},
			feedLinks: {
				atom: `https://wordfeed.now.sh/plugins/${slug}`
			}
		});
		feed.addItem({
			title: `${json.name} v${json.version}`,
			link: json.download_link,
			date: new Date(json.last_updated.slice(0, 10)),
			content: `${json.name} v${json.version}: <a href="${json.download_link}">${json.download_link}</a>`
		});
		response.status(200).send(feed.atom1());
	}
};
