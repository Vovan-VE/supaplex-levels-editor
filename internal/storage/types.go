package storage

type Single[V any] interface {
	GetItem(key string) (value V, ok bool, err error)
	SetItem(key string, value V) error
	RemoveItem(key string) error
}

type Mapped[V any] interface {
	GetAll() (map[string]V, error)
	SetAll(all map[string]V) error
}

type Full[V any] interface {
	Single[V]
	Mapped[V]
}
