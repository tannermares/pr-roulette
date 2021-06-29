import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { StackView, Text } from '@planning-center/ui-kit'

function App() {
  const { loading, error, data } = useQuery(QUERY)

  return (
    <StackView distribution="center" height="100vh" textAlign="center">
      <Text>Hello From UI kit</Text>
    </StackView>
  )
}

const QUERY = gql`
  query GetRepos {
    repositories {
      nodes {
        
      }
    }
  }
`

export default App
