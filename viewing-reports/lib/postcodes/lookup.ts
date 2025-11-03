interface PostcodeLookupResult {
  postcode: string
  line_1: string
  line_2?: string
  line_3?: string
  post_town: string
  county?: string
  formatted: string
}

export async function lookupPostcode(
  postcode: string
): Promise<PostcodeLookupResult[]> {
  try {
    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}`,
      {
        headers: {
          Authorization: `api_key=${process.env.IDEAL_POSTCODES_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Postcode lookup failed')
    }

    const data = await response.json()

    return data.result.map((address: any) => ({
      postcode: address.postcode,
      line_1: address.line_1,
      line_2: address.line_2,
      line_3: address.line_3,
      post_town: address.post_town,
      county: address.county,
      formatted: [
        address.line_1,
        address.line_2,
        address.line_3,
        address.post_town,
        address.postcode,
      ]
        .filter(Boolean)
        .join(', '),
    }))
  } catch (error) {
    console.error('Postcode lookup error:', error)
    return []
  }
}

export async function autocompletePostcode(
  partial: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/autocomplete/postcodes?q=${encodeURIComponent(partial)}`,
      {
        headers: {
          Authorization: `api_key=${process.env.IDEAL_POSTCODES_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.result.hits.map((hit: any) => hit.suggestion)
  } catch (error) {
    console.error('Postcode autocomplete error:', error)
    return []
  }
}
