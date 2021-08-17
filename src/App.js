import React, { useEffect, useRef, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Divider,
  Heading,
  Input,
  Select,
  StackView,
  Spinner,
  Link,
  Text,
} from '@planning-center/ui-kit'

function App() {
  const [language, setLanguage] = useState('javascript')
  const [query, setQuery] = useState('')
  const { data, error, loading, refetch } = useQuery(QUERY, {
    variables: {
      q: `${query} in:title,body,comments is:pull-request language:${language} state:open -author:app/dependabot -author:snyk-bot`,
    },
  })
  const didMountRef = useRef()

  useEffect(() => {
    if (didMountRef.current) refetch()
    else didMountRef.current = true
  }, [language, query])

  return (
    <StackView distribution="center" height="100vh" >
      <StackView 
        axis="horizontal"
        distribution="center"
        marginBottom={2}
        spacing={2}
      >
        <Heading>Pull Request Roulette</Heading>
        <Input 
          placeholder='Filter by stuff' 
          value={query} 
          onChange={({ target: { value } }) => setQuery(value)}
        />
        <Select
          tooltip={{ title: 'Select a language' }}
          onChange={({ selectedValue }) => setLanguage(selectedValue)}
          value={language}
          width={15}
        >
          <Select.Option value="javascript">JavaScript</Select.Option>
          <Select.Option value="swift">Swift</Select.Option>
          <Select.Option value="ruby">Ruby</Select.Option>
          <Select.Option value="java">Java</Select.Option>
          <Select.Option value="PHP" disabled>PHP</Select.Option>
        </Select>
      </StackView>
      <Divider marginBottom={2} />
      {loading ?
        <StackView distribution="center" textAlign="center">
          <Spinner size="xxl" />
        </StackView>
        : error 
        ? <StackView distribution="center" textAlign="center">
            <Text>{JSON.stringify(error)}</Text>
          </StackView>
        : <StackView axis="vertical" alignItems="center" >
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
        }
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
