import path from "path";
import axios from "axios";
const fs = require("fs");
const klaw = require("klaw");
const matter = require("gray-matter");

function getPosts() {
  const items = [];
  // Walk ("klaw") through posts directory and push file paths into items array //
  const getFiles = () =>
    new Promise(resolve => {
      // Check if posts directory exists //
      if (fs.existsSync("./src/community-service")) {
        klaw("./src/community-service")
          .on("data", item => {
            // Filter function to retrieve .md files //
            if (path.extname(item.path) === ".md") {
              // If markdown file, read contents //
              const data = fs.readFileSync(item.path, "utf8");
              // Convert to frontmatter object and markdown content //
              const dataObj = matter(data);
              // Create slug for URL //
              dataObj.data.slug = dataObj.data.title
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
              // Remove unused key //
              delete dataObj.orig;
              // Push object into items array //
              items.push(dataObj);
            }
          })
          .on("error", e => {
            console.log(e);
          })
          .on("end", () => {
            // Resolve promise for async getRoutes request //
            // posts = items for below routes //
            resolve(items);
          });
      } else {
        // If src/posts directory doesn't exist, return items as empty array //
        resolve(items);
      }
    });
  return getFiles(); 
}

export default {
  // siteRoot: '',

  getRoutes: async () => {

    const { data: posts } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const test = await getPosts()

    return [
      {
        path: "/blog",
        getData: () => ({
          posts
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          template: "src/containers/Post",
          getData: () => ({
            post
          })
        }))
      },
      {
        path: "/test",
        getData: () => ({
          test
        }),
      }
    ];
  },
  plugins: [
    [
      require.resolve("react-static-plugin-source-filesystem"),
      {
        location: path.resolve("./src/pages")
      }
    ],
    require.resolve("react-static-plugin-reach-router"),
    require.resolve("react-static-plugin-sitemap")
  ]
};
