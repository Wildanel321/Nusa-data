import { DbDataProvider } from "./DbDataProvider";
import { MockDataProvider } from "./MockDataProvider";

// Choose provider: if DB URL is provided, use DB, otherwise use mock
const useDb = !!process.env.DATABASE_URL;
const dataProvider = useDb ? new DbDataProvider() : new MockDataProvider();

export default dataProvider;
