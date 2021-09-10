import Box2DFactory from 'box2d-wasm';

export const initializeBox2D = async (box2dPath = '') => {
	const box2D: typeof Box2D & EmscriptenModule = await Box2DFactory({
		locateFile: (url) => box2dPath + url
	});

	const helpers = initializeHelpers(box2D);

	return { box2D, helpers };
};

const initializeHelpers = (box2D: typeof Box2D & EmscriptenModule) => {
	const copyVec2 = (vec: Box2D.b2Vec2): Box2D.b2Vec2 => {
		const { b2Vec2 } = box2D;
		return new b2Vec2(vec.get_x(), vec.get_y());
	};

	/** to replace original C++ operator * (float) */
	const scaleVec2 = (vec: Box2D.b2Vec2, scale: number): void => {
		vec.set_x(scale * vec.get_x());
		vec.set_y(scale * vec.get_y());
	};

	/** to replace original C++ operator *= (float) */
	const scaledVec2 = (vec: Box2D.b2Vec2, scale: number): Box2D.b2Vec2 => {
		const { b2Vec2 } = box2D;
		return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
	};

	// http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
	const createChainShape = (vertices: Box2D.b2Vec2[], closedLoop: boolean): Box2D.b2ChainShape => {
		const { _malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer } = box2D;
		const shape = new b2ChainShape();
		const buffer = _malloc(vertices.length * 8);
		let offset = 0;
		for (let i = 0; i < vertices.length; i++) {
			HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
			HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
			offset += 8;
		}
		const ptr_wrapped = wrapPointer(buffer, b2Vec2);
		if (closedLoop) {
			shape.CreateLoop(ptr_wrapped, vertices.length);
		} else {
			throw new Error('CreateChain API has changed in Box2D 2.4, need to update this');
			// shape.CreateChain(ptr_wrapped, vertices.length);
		}
		return shape;
	};

	const createPolygonShape = (vertices: Box2D.b2Vec2[]): Box2D.b2PolygonShape => {
		const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } = box2D;
		const shape = new b2PolygonShape();
		const buffer = _malloc(vertices.length * 8);
		let offset = 0;
		for (let i = 0; i < vertices.length; i++) {
			HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
			HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
			offset += 8;
		}
		const ptr_wrapped = wrapPointer(buffer, b2Vec2);
		shape.Set(ptr_wrapped, vertices.length);
		return shape;
	};

	const createRandomPolygonShape = (radius: number): Box2D.b2PolygonShape => {
		const { b2Vec2 } = box2D;
		let numVerts = 3.5 + Math.random() * 5;
		numVerts = numVerts | 0;
		const verts = [];
		for (let i = 0; i < numVerts; i++) {
			const angle = (i / numVerts) * 360.0 * 0.0174532925199432957;
			verts.push(new b2Vec2(radius * Math.sin(angle), radius * -Math.cos(angle)));
		}
		return createPolygonShape(verts);
	};

	return {
		copyVec2,
		scaleVec2,
		scaledVec2,
		createChainShape,
		createPolygonShape,
		createRandomPolygonShape
	};
};

export const createWorld = (
	box2D: typeof Box2D & EmscriptenModule,
	options?: IWorldOptions
): Box2D.b2World => {
	const { b2Vec2, b2World } = box2D;

	const defaultOptions: IWorldOptions = {
		gravity: new b2Vec2(0.0, -10.0)
	};

	options = Object.assign(defaultOptions, options);

	const world = new b2World(options.gravity);

	return world;
};

interface IWorldOptions {
	gravity: number | Box2D.b2Vec2;
}
