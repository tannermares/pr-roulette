import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Divider,
  Heading,
  StackView,
  Spinner,
  Link,
  Text,
} from '@planning-center/ui-kit'

function App() {
  const { data, error, loading } = useQuery(QUERY, {
    variables: {
      q: 'is:pull-request language:java state:open -author:app/dependabot -author:snyk-bot',
    },
  })

  if (loading)
    return (
      <StackView distribution="center" height="100vh" textAlign="center">
        <Spinner size="xxl" />
      </StackView>
    )
  if (error)
    return (
      <StackView distribution="center" height="100vh" textAlign="center">
        <Text>{JSON.stringify(error)}</Text>
      </StackView>
    )

  return (
    <StackView distribution="center" height="100vh" textAlign="center">
      <Heading>Pull Request Roulette</Heading>
      <Divider marginBottom={2} />
      {data.search.nodes.map((pullRequest) => (
        <Link
          key={pullRequest.permalink}
          to={pullRequest.permalink}
          external
          margin={1}
        >
          {pullRequest.title}
        </Link>
      ))}
    </StackView>
  )
}

const QUERY = gql`
  query PRSearch($q: String!) {
    search(first: 10, query: $q, type: ISSUE) {
      nodes {
        ... on PullRequest {
          permalink
          title
          author {
            ... on Bot {
              login
            }
          }
        }
      }
    }
  }
`

export default App
