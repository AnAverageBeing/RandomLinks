package utils

import "net/http"

func IsURLValid(url string) bool {
	resp, err := http.Head(url)
	if err != nil || resp.StatusCode != http.StatusOK {
		return false
	}
	return true
}
