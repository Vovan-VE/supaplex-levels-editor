export namespace backend {
	
	export class StringRef {
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new StringRef(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.value = source["value"];
	    }
	}

}

export namespace files {
	
	export class Record {
	    key: string;
	    blob64: string;
	    options: string;
	
	    static createFrom(source: any = {}) {
	        return new Record(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.blob64 = source["blob64"];
	        this.options = source["options"];
	    }
	}
	export class WebFileRef {
	    $$id: string;
	    $$blob64: string;
	    name: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new WebFileRef(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.$$id = source["$$id"];
	        this.$$blob64 = source["$$blob64"];
	        this.name = source["name"];
	        this.size = source["size"];
	    }
	}

}

