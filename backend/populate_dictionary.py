
import requests
import json

# List of financial terms to fetch definitions for
financial_terms = [
    "Stock",
    "Bond",
    "Mutual Fund",
    "ETF",
    "Asset",
    "Liability",
    "Equity",
    "Dividend",
    "IPO",
    "Bull Market",
    "Bear Market",
    "Capital Gain",
    "Diversification",
    "Inflation",
    "Interest Rate",
    "Portfolio",
    "Recession",
    "Risk Tolerance",
    "401(k)",
    "IRA"
]

financial_dictionary = {}

for term in financial_terms:
    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{term}")
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        
        # Extract the first definition
        if data and isinstance(data, list):
            meanings = data[0].get('meanings', [])
            if meanings:
                definitions = meanings[0].get('definitions', [])
                if definitions:
                    definition = definitions[0].get('definition')
                    if definition:
                        financial_dictionary[term.lower()] = {"definition": definition}
                        print(f"Successfully fetched definition for: {term}")
                    else:
                        print(f"Could not find definition for: {term}")
                else:
                    print(f"Could not find definitions list for: {term}")
            else:
                print(f"Could not find meanings for: {term}")
        else:
            print(f"No data or unexpected format for: {term}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching definition for {term}: {e}")
    except (KeyError, IndexError) as e:
        print(f"Error parsing definition for {term}: {e}")

# Write the dictionary to the JSON file
output_path = '../frontend/lib/financial-terms.json'
with open(output_path, 'w') as f:
    json.dump(financial_dictionary, f, indent=2)

print(f"\nSuccessfully created financial dictionary at: {output_path}")
