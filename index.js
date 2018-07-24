const { parse } = require("url");
const fetch = require("node-fetch");
const { createError } = require("micro");
const cache = require("micro-cacheable");
const Feed = require("pfeed");

const microFn = async req => {
  const params = parse(req.url).pathname;
  const [type, slug] = params.substring(1).split("/");
  if (!type || !slug) {
    throw createError(
      500,
      "Missing parameters: <plugins|themes>/<plugin-slug|theme-slug>."
    );
  }
  const endpoint =
    type === "plugins"
      ? `https://api.wordpress.org/plugins/info/1.0/${slug}.json`
      : `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${slug}`;
  const response = await fetch(endpoint);
  const json = await response.json();

  if (response.status === 404) {
    throw createError(404, `The ${type.replace("s", "")} could not be found.`);
  } else if (response.status === 200) {
    const feed = new Feed({
      title: `${json.name} Updates`,
      description: `Unofficial update feed for <a href="https://wordpress.org/${type}/${slug}">${
        json.name
      }</a>.`,
      id: `https://wordfeed.now.sh/${type}/${slug}`,
      link: `https://wordfeed.now.sh/${type}/${slug}`,
      feedLinks: {
        atom: `https://example.com/atom/${type}/${slug}`
      }
    });
    feed.addItem({
      title: `${json.name} v${json.version}`,
      link: json.download_link,
      date: new Date(json.last_updated.substring(0, 10))
    });
    return feed.atom1();
  }
};

module.exports = cache(24 * 60 * 60 * 1000, microFn);
