import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { StackView, Link, Text } from '@planning-center/ui-kit'

function App() {
  const { data, error, loading } = useQuery(QUERY, {
    q: 'is:pull-request language:java state:open',
  })

  if (loading) return <Text>Loading</Text>
  if (error)
    return (
      <StackView distribution="center" height="100vh" textAlign="center">
        <Text>{JSON.stringify(error)}</Text>
      </StackView>
    )

  console.log(data)

  return (
    <StackView distribution="center" height="100vh" textAlign="center">
      {/* {issues.map((issue) => (
        <>
          <Text>{issue.node.title}</Text>
          <Link>{issue.node.url}</Link>
        </>
      ))} */}
    </StackView>
  )
}

const QUERY = gql`
  query PRSearch {
    search(
      first: 10
      query: "is:pull-request language:java state:open"
      type: ISSUE
    ) {
      edges {
        node {
          ... on Issue {
            resourcePath
          }
        }
      }
    }
  }
`

export default App
