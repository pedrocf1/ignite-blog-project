import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FaCalendar, FaUser } from 'react-icons/fa';
import format from 'date-fns/format/index';

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
      <img src={post.data.banner.url} alt="" />
      <div className={styles.postContentContainer}>
        <h1>{post.data.title}</h1>
        <time>
          <FaCalendar/> {format(new Date(post.first_publication_date), 'dd MMM yyy')}
        </time>
        <span> <FaUser/> {post.data.author} </span>
        {post.data.content.map(content => (
            <>
              <p className={styles.contentHeading}>
                {content.heading}
              </p> 
              {content.body.map(contentBody => (
                <div className={styles.contentBody}
                  dangerouslySetInnerHTML={{ __html: contentBody.text }} 
                >
                </div>
              ))}
            </>
          ))}
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
