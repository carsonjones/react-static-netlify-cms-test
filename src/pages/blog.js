import React from 'react'
// provides the route's data
import { useRouteData } from 'react-static'
import { Link } from 'components/Router'

// making a ul of links to all of the individual blog posts
export default function Blog() {
  const { posts } = useRouteData()
  return ( 
    <div>
      <h1>It's blog time.</h1>
      <div>
        <a href="#bottom" id="top">
          Scroll to bottom!
        </a>
      </div>
      <br />
      All Posts:
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            {/* linking to individual post routes set by children property of /blog route */}
            <Link to={`/blog/post/${post.id}/`}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <a href="#top" id="bottom">
        Scroll to top!
      </a>
    </div>
  )
}