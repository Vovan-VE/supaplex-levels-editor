package helpers

func CopyMap[K comparable, V any](src map[K]V) map[K]V {
	dst := make(map[K]V)
	for k, v := range src {
		dst[k] = v
	}
	return dst
}
