package config

import (
	"context"
	"encoding/json"
	"strconv"
	"strings"

	"github.com/pkg/errors"
	"github.com/vovan-ve/sple-desktop/internal/github"
)

type UpdateRelease struct {
	Version string
}

func UpdateReleaseFetch(ctx context.Context) (*UpdateRelease, error) {
	r, err := github.FetchLatestRelease(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "fetch latest release")
	}
	if r.Draft || r.Prerelease || r.TagName == "" {
		return nil, nil
	}
	return &UpdateRelease{Version: r.TagName}, nil
}

func UpdateReleaseFromString(s string) *UpdateRelease {
	if s == "" {
		return nil
	}
	v := new(UpdateRelease)
	if err := json.Unmarshal([]byte(s), v); err != nil {
		return nil
	}
	return v
}
func (r *UpdateRelease) String() string {
	if r == nil {
		return ""
	}
	b, err := json.Marshal(&r)
	if err != nil {
		// TODO: log
		return ""
	}
	return string(b)
}
func (r *UpdateRelease) IsNewer(prev *UpdateRelease) bool {
	if r == nil {
		return false
	}
	b := parseParts(r.Version)
	if b == nil {
		return false
	}

	if prev == nil {
		return true
	}
	a := parseParts(prev.Version)
	if a == nil {
		return true
	}
	return cmpParts(*a, *b) < 0
}
func (r *UpdateRelease) VersionNumber() string {
	if r == nil || r.Version == "" {
		return ""
	}
	if r.Version[0] == 'v' {
		return r.Version[1:]
	}
	return r.Version
}

type parts struct {
	num []int
	tag string
}

func parseParts(v string) *parts {
	if v == "" {
		return nil
	}
	if v[0] == 'v' {
		v = v[1:]
	}
	main := strings.SplitN(v, "-", 2)
	nums := strings.Split(main[0], ".")

	var err error
	var p parts
	p.num = make([]int, len(nums))
	for i, num := range nums {
		p.num[i], err = strconv.Atoi(num)
		if err != nil {
			return nil
		}
	}
	if len(main) > 1 {
		p.tag = main[1]
	}
	return &p
}
func cmpParts(a, b parts) int8 {
	la, lb := len(a.num), len(b.num)
	for i := 0; i < la || i < lb; i++ {
		if i >= la {
			return -1
		}
		if i >= lb {
			return 1
		}
		an, bn := a.num[i], b.num[i]
		if an < bn {
			return -1
		}
		if an > bn {
			return 1
		}
	}
	if a.tag == "" {
		if b.tag != "" {
			return -1
		}
	} else {
		if b.tag == "" {
			return 1
		}
		// stable release will not have `-tag` in version
	}
	return 0
}
