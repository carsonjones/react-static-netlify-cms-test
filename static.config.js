import path from "path";
import axios from "axios";
//for reading local files
import fs  from "fs";
import klaw from "klaw";
import matter from "gray-matter";

function getPosts() {
  const items = [];
  // Walk ("klaw") through posts directory and push file paths into items array //
  const getFiles = () =>
    new Promise(resolve => {
      // Check if test-collect directory exists //
      // This is the folder where your CMS collection we made earlier will store it's content. Creating a post inside this collection will add a "test-collection" directory to your repo for you.
      if (fs.existsSync("./src/test-collection")) {
        klaw("./src/test-collection")
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

  // resolves an array of route objects 
  getRoutes: async () => {

    // this is where you can make requests for data that will be needed for all
    // routes or multiple routes - values returned can then be reused in route objects below

    // starter template has a request to an endpoint that retrieves an array of fake blog posts
    const { data: posts } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const test = await getPosts()

    return [
      // route object
      {
        // React Static looks for files in src/pages (line 94) and matches them to path
        path: "/blog",
        // function that returns data for this specific route
        getData: () => ({
          posts
        }),
        // an array of children routes
        // in this case we are mapping through the blog posts from the post variable above
        // and setting a custom route for each one based off their post id
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          // location of template for child route
          template: "src/containers/Post",
          // passing the individual post data needed
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
        children: test.map(post => ({
          // actual path will be /test/"whatever the post slug is"
          path: `/${post.data.slug}`,
          // location of template for child route
          template: "src/containers/Test-Post",
          // passing the individual post data needed
          getData: () => ({
            post
          })
        }))
      }
    ];
  },
  // basic template default plugins
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