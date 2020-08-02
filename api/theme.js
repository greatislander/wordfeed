const fetch = require('node-fetch');

import {Feed} from 'feed';

module.exports = async (request, response) => {
	const {slug} = request.query;
	const endpoint = `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${slug}`;
	const data = await fetch(endpoint);
	const json = await data.json();
	if (data.status === 404) {
		response.status(200).send('The theme could not be found');
	} else {
		const feed = new Feed({
			title: `${json.name} Updates`,
			description: `Unofficial update feed for ${json.name}.`,
			id: `https://wordfeed.vercel.app/themes/${slug}`,
			link: `https://wordfeed.vercel.app/themes/${slug}`,
			generator: 'Wordfeed',
			author: {
				name: 'Ned Zimmerman',
				email: 'ned@bight.dev',
				link: 'https://bight.dev'
			},
			feedLinks: {
				atom: `https://wordfeed.vercel.app/themes/${slug}`
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
