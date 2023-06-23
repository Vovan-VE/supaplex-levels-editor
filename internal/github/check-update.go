package github

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/pkg/errors"
)

type Release struct {
	TagName    string `json:"tag_name"`
	Draft      bool   `json:"draft"`
	Prerelease bool   `json:"prerelease"`
	//CreatedAt   time.Time `json:"created_at"`
	//PublishedAt time.Time `json:"published_at"`
}

const (
	ghApiBase      = "https://api.github.com"
	ghApiVerHeader = "X-GitHub-Api-Version"
	ghApiVerValue  = "2022-11-28"
)
const (
	repoUser = "vovan-ve"
	repoName = "supaplex-levels-editor"
)

// https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
const latestReleaseUrl = ghApiBase + "/repos/" + repoUser + "/" + repoName + "/releases/latest"

func FetchLatestRelease(ctx context.Context) (*Release, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, latestReleaseUrl, nil)
	if err != nil {
		return nil, errors.Wrap(err, "http.NewRequest")
	}
	req.Header.Set(ghApiVerHeader, ghApiVerValue)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request")
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, errors.Wrap(err, "read body")
	}

	release := new(Release)
	err = json.Unmarshal(body, release)
	if err != nil {
		return nil, errors.Wrap(err, "json parse")
	}

	return release, nil
}
