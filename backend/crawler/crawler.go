package crawler

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type PageAnalysis struct {
	HTMLVersion    string
	Title          string
	Headings       map[string]int
	InternalLinks  int
	ExternalLinks  int
	Inaccessible   int
	HasLoginForm   bool
	BrokenLinks    []BrokenLink
}

type BrokenLink struct {
	URL        string
	StatusCode int
}

func AnalyzePage(pageURL string) (*PageAnalysis, error) {
	// Fetch the page
	resp, err := http.Get(pageURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	analysis := &PageAnalysis{
		Headings: make(map[string]int),
	}

	// Get HTML version
	html, _ := doc.Html()
	analysis.HTMLVersion = detectHTMLVersion(html)

	// Get title
	analysis.Title = doc.Find("title").Text()

	// Count headings
	for i := 1; i <= 6; i++ {
		level := fmt.Sprintf("h%d", i)
		analysis.Headings[level] = doc.Find(level).Length()
	}

	// Check for login form
	analysis.HasLoginForm = doc.Find("input[type='password']").Length() > 0

	// Parse domain for internal/external links
	baseURL, _ := url.Parse(pageURL)
	baseDomain := baseURL.Hostname()

	// Process all links
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" {
			return
		}

		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}

		// Resolve relative URLs
		if !linkURL.IsAbs() {
			linkURL = baseURL.ResolveReference(linkURL)
		}

		// Check if link is internal
		isInternal := strings.HasSuffix(linkURL.Hostname(), baseDomain)

		// Check link accessibility
		statusCode, accessible := checkLinkAccessibility(linkURL.String())
		if !accessible {
			analysis.Inaccessible++
			analysis.BrokenLinks = append(analysis.BrokenLinks, BrokenLink{
				URL:        linkURL.String(),
				StatusCode: statusCode,
			})
		}

		if isInternal {
			analysis.InternalLinks++
		} else {
			analysis.ExternalLinks++
		}
	})

	return analysis, nil
}

func detectHTMLVersion(html string) string {
	// Simplified version detection
	if strings.Contains(html, "<!DOCTYPE html>") {
		return "HTML5"
	} else if strings.Contains(html, "<!DOCTYPE HTML PUBLIC") {
		return "HTML4"
	}
	return "Unknown"
}

func checkLinkAccessibility(url string) (int, bool) {
	resp, err := http.Head(url)
	if err != nil {
		return 0, false
	}
	defer resp.Body.Close()

	return resp.StatusCode, resp.StatusCode < 400
}
