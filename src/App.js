import React, { useEffect, useRef, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Button,
  DataTable,
  Heading,
  Input,
  Select,
  StackView,
  Text,
} from '@planning-center/ui-kit'

function App() {
  const [language, setLanguage] = useState('javascript')
  const [query, setQuery] = useState('')
  const queryString = `${query} in:title,body,comments is:pull-request language:${language} state:open -author:app/dependabot -author:snyk-bot sort:reactions`
  const { data, error, loading, refetch } = useQuery(QUERY, {
    variables: {
      q: queryString,
    },
  })
  const didMountRef = useRef()

  useEffect(() => {
    if (didMountRef.current) refetch()
    else didMountRef.current = true
  }, [language, query])

  function handlePreviousPage() {
    refetch({ before: data?.search?.pageInfo?.startCursor, q: queryString })
  }

  function handleNextPage() {
    refetch({ after: data?.search?.pageInfo?.endCursor, q: queryString })
  }

  return (
    <StackView position="relative" height="100vh">
      <StackView
        axis="horizontal"
        distribution="center"
        spacing={2}
        padding={1}
        position="sticky"
        top={0}
        zIndex={99999}
        backgroundColor="whitesmoke"
        borderBottomWidth={1}
        borderBottomColor="darkgray"
      >
        <Heading>Pull Request Roulette</Heading>
        <Input
          placeholder="Filter by stuff"
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
          <Select.Option value="PHP" disabled>
            PHP
          </Select.Option>
        </Select>
      </StackView>
      {error ? (
        <StackView distribution="center" textAlign="center">
          <Text>{JSON.stringify(error)}</Text>
        </StackView>
      ) : (
        <StackView>
          <DataTable
            columns={[
              {
                id: 'title',
                header: 'Title',
                cell: 'title',
              },
            ]}
            data={data?.search?.nodes || []}
            empty={<Text>EMPTY</Text>}
            loading={loading}
            getRowLink={({ permalink }) => permalink}
          />
          <StackView axis="horizontal" distribution="center" spacing={2}>
            <Button
              disabled={!data?.search?.pageInfo?.hasPreviousPage}
              icon={{ name: 'caret-left' }}
              onClick={handlePreviousPage}
              size="lg"
              title="Back"
              variant="naked"
            />
            <Button
              disabled={!data?.search?.pageInfo?.hasNextPage}
              icon={{ name: 'caret-right' }}
              onClick={handleNextPage}
              size="lg"
              title="Forward"
              variant="naked"
            />
          </StackView>
        </StackView>
      )}
    </StackView>
  )
}

const QUERY = gql`
  query PRSearch($q: String!, $before: String, $after: String) {
    search(after: $after, before: $before, first: 10, query: $q, type: ISSUE) {
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
      issueCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

export default App
