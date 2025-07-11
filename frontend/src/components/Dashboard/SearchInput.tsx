// Add this import at the top of your search component file
import { useDebounce } from '../hooks/useDebounce';

// Update your component to use debouncing
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchResults = async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };

      fetchResults();
    } else {
      setResults([]); // Clear results when search term is empty
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search URLs..."
        className="search-input"
      />
      {/* Render search results if needed */}
      {results.length > 0 && (
        <div className="search-results">
          {results.map(result => (
            <div key={result.id}>{result.url}</div>
          ))}
        </div>
      )}
    </div>
  );
}
