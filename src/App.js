import React, { useEffect, useRef, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  DataTable,
  Heading,
  Input,
  Pagination,
  Select,
  StackView,
  Text,
} from '@planning-center/ui-kit'

function App() {
  const [language, setLanguage] = useState('javascript')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const { data, error, loading, refetch } = useQuery(QUERY, {
    variables: {
      q: `${query} in:title,body,comments is:pull-request language:${language} state:open -author:app/dependabot -author:snyk-bot sort:reactions`,
    },
  })
  const didMountRef = useRef()

  useEffect(() => {
    if (didMountRef.current) refetch()
    else didMountRef.current = true
  }, [language, query])

  return (
    <StackView position="relative" height="50vh">
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
        <StackView overflow="scroll">
          <DataTable
            columns={[
              {
                id: 'title',
                header: 'Title',
                cell: 'title',
              },
              {
                id: 'permalink',
                header: 'Link',
                cell: 'permalink',
              },
            ]}
            data={data ? data.search.nodes : []}
            loading={loading}
          />
          <Pagination
            currentPage={page}
            onPageChange={(value) => setPage(value)}
            totalPages={10}
            visiblePages={10}
          />
        </StackView>
      )}
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
