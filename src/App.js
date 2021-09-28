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
  const botsWeHate = ['app/dependabot', 'snyk-bot', 'app/pull']
  const botFilter = botsWeHate.map((bot) => `-author:${bot}`).join(' ')
  const today = new Date().toISOString().split('T')[0]
  const queryString = `${query} in:title,body,comments is:pull-request language:${language} state:open ${botFilter} updated:>=${today} sort:interactions`
  const { data, error, loading, refetch } = useQuery(QUERY, {
    variables: { first: 10, q: queryString },
  })
  const didMountRef = useRef()

  useEffect(() => {
    if (didMountRef.current) refetch()
    else didMountRef.current = true
  }, [language, query])

  function handlePreviousPage() {
    refetch({
      before: data?.search?.pageInfo?.startCursor,
      last: 10,
      after: null,
      first: null,
    })
  }

  function handleNextPage() {
    refetch({
      after: data?.search?.pageInfo?.endCursor,
      first: 10,
      before: null,
      last: null,
    })
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
              {
                id: 'repository',
                header: 'Repository',
                cell: ({ repository }) => repository.nameWithOwner,
              },
              {
                id: 'stargazers',
                header: 'StarGazers',
                cell: ({ repository }) => repository.stargazerCount,
              },
            ]}
            data={data?.search?.nodes || []}
            empty={<Text>EMPTY</Text>}
            loading={loading}
            onRowClick={({ permalink }) => window.open(permalink)}
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
  query PRSearch(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $q: String!
  ) {
    search(
      after: $after
      before: $before
      first: $first
      last: $last
      query: $q
      type: ISSUE
    ) {
      nodes {
        ... on PullRequest {
          permalink
          title
          author {
            ... on Bot {
              login
            }
          }
          repository {
            name
            nameWithOwner
            stargazerCount
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
