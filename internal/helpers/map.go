package helpers

func CopyMap[K comparable, V any](src map[K]V) map[K]V {
	dst := make(map[K]V)
	for k, v := range src {
		dst[k] = v
	}
	return dst
}

func CopyMapCast[K comparable, V, U any](src map[K]V, cast func(V) U) map[K]U {
	dst := make(map[K]U)
	for k, v := range src {
		dst[k] = cast(v)
	}
	return dst
}
