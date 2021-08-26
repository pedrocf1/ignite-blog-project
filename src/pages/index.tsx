import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }:HomeProps ) {
  return (
    <div className={styles.container}>
      <div className={styles.posts}>
        {postsPagination.results.map(post=> (
          <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <span>{post.data.author}</span>
                <time>{post.first_publication_date}</time>
              </a>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],{
    fetch: ['publication.title', 'publication.content'],
    pageSize: 5
  });

  console.log("postsResponse", JSON.stringify(postsResponse, null, 2))

  const posts: Post[] = postsResponse.results.map(post=>{
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data:{
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }

      }   
  })

  return {
    props:{
      postsPagination:{
        results: posts,
        next_page: ''
      }
    }
  }
};
