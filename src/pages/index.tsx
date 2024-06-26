import { GetStaticProps } from 'next'
import Image  from 'next/image'
import Head  from 'next/head'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api'
import {convertDurationToTimeString} from "../utils/convertDurationToTimeString";

import styles from './home.module.scss'
import {useContext, useEffect, useState} from "react";
import {PlayerContext} from "../contexts/PlayerContext";

type Episode = {
  id: string,
  title: string,
  thumbnail: string,
  members: string,
  publishedAt: string,
  duration: number,
  durationAsString: string,
  description: string,
  url: string
}

type HomeProps = {
  latestEpisodes: Array<Episode>,
  allEpisodes: Array<Episode>
}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  const { playList, play } = useContext(PlayerContext)
  const [clientSide, setClientSide] = useState(false)

  const episodeList = [...latestEpisodes, ...allEpisodes]

  useEffect(() => {
    setClientSide(true)
  }, [])
  
  return clientSide && (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  style={{objectFit: 'cover'}} />

                <div className={styles.episodeDetails}>
                  <Link href={`/episode/${episode.id}`}>
                    {episode.title}
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th> </th>
          </thead>
          <tbody>
          {allEpisodes.map((episode, index) => {
            return (
              <tr key={episode.id}>
                <td>
                  <Image
                    width={128}
                    height={128}
                    src={episode.thumbnail}
                    alt={episode.title}
                    style={{objectFit: 'cover'}} />
                </td>
                <td>
                  <Link href={`/episode/${episode.id}`}>
                    {episode.title}
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td style={{ width: 100 }}>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                    <img src="/play-green.svg" alt="Tocar episódio "/>
                  </button>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </section>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url
    }
  })

  const latestEpisodes = episodes.slice(0, 2)
  const allEpisodes = episodes.slice(2, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes
    }
  }
}
