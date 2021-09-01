import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log("post", post)
  return (
    <div className={styles.postContainer}>
      <h1>irré</h1>
      <div
        dangerouslySetInnerHTML={{ __html: post.data.content[0].body[0].text }} 
      >

      </div>
    </div>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths: GetStaticPaths = async () => {
  return {
      paths: [ ],
      fallback: 'blocking'
      // true, false, 'blocking'
  }
}

export const getStaticProps = async ({ params }) => {
  console.log("context", params)
  const { slug } = params;

  const prismic = getPrismicClient();
  
  const response = await prismic.getByUID('posts', String(slug), {});
    
  const post:Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body:  content.body.map(contentBody => {
            return {text: contentBody.text}
          }),
        }
      })
    }
  }
 
  return {
    props:{
      post
    }
  }
};
