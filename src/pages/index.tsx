import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import format from 'date-fns/format/index';
import pt from 'date-fns/locale/pt-BR';
import { FaCalendar, FaUser } from 'react-icons/fa'


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
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  function loadMorePosts(){
    if(!nextPage){
      return;
    }

    fetch(nextPage)
      .then(function(response) {
        return response.json()
      }).then(function(data){
        setPosts(oldState => [
          ...oldState,
          {
            uid: data.results[0].uid,
            first_publication_date: data.results[0].first_publication_date,
            data: {
              title: data.results[0].data.title,
              subtitle: data.results[0].data.subtitle,
              author: data.results[0].data.author,
            }
          }
        ]);

        setNextPage(data.next_page)
      })

  }

  return (
    <div className={styles.container}>
      <div className={styles.posts}>
        {posts.map(post=> (
          <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>
                  <FaCalendar/> {format(new Date(post.first_publication_date), 'dd MM yyy')}
                </time>
                <span> <FaUser/> {post.data.author} </span>
              </a>
          </Link>
        ))}
        <p onClick={()=>loadMorePosts()} className={styles.loadMorePosts}>Carregar mais posts</p>
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
    pageSize: 5,
    page:1
  });

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
        next_page: postsResponse.next_page
      }
    }
  }
};
