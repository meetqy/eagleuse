import { ConfigProvider, Layout, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  activeMenuState,
  countState,
  foldersState,
  LayoutContentRefContext,
  tagsState,
} from "@/store";
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import SiderMenu from "./Sider/Menu";
import SiderBasic from "./Sider/Basic";
import Head from "next/head";

export const MyLayout = ({ children }) => {
  const activeMenu = useRecoilValue(activeMenuState) || "/";
  const [_tags, setTags] = useRecoilState(tagsState);
  const [_counts, setCount] = useRecoilState(countState);
  const [_folders, setFolders] = useRecoilState(foldersState);
  const collapsed = useMemo(() => activeMenu.includes("/tags"), [activeMenu]);
  const [isInit] = useState({
    tags: false,
    folders: false,
  });

  const LayoutContentRefC = useContext(LayoutContentRefContext);
  const layoutContentRef = useRef(null);

  useImperativeHandle(LayoutContentRefC, () => layoutContentRef);

  // 初始化 folderState
  const initFolder = useCallback(() => {
    isInit.folders = true;
    fetch("/api/folder")
      .then((res) => res.json())
      .then(({ data }) => {
        setFolders(data);
      });
  }, [isInit, setFolders]);

  const initTag = useCallback(() => {
    isInit.tags = true;
    fetch("/api/tag")
      .then((res) => res.json())
      .then(({ count, data }) => {
        setCount((cur) => {
          return {
            ...cur,
            tags: count,
          };
        });
        setTags(data);
      });
  }, [isInit, setCount, setTags]);

  useEffect(() => {
    if (!isInit.tags) {
      initTag();
    }

    if (!isInit.folders) {
      initFolder();
    }
  }, [isInit, initTag, initFolder]);

  // 解决菜单闪烁问题
  if (!isInit.folders) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          // colorPrimary: "#d0d0d0",
        },
        algorithm: theme.defaultAlgorithm,
      }}
      locale={zhCN}
    >
      <Head>
        <title>rao.pics - eagleuse搭建的图片站</title>
        <link rel="shortcut icon" href="/static/favicon.ico" />
        <meta
          name="description"
          content="把 eagle 变成我的图片（后台）管理系统。"
        />
      </Head>
      <Layout style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
        <Layout.Sider
          width={240}
          theme="light"
          className="scroll-bar"
          style={{
            borderRight: "1px solid #eee",
            height: "100%",
            overflowY: "scroll",
          }}
        >
          <SiderMenu />
        </Layout.Sider>
        <Layout.Content
          ref={layoutContentRef}
          className="scroll-bar"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            height: "100%",
          }}
        >
          {children}
        </Layout.Content>
        <Layout.Sider
          width={240}
          theme="light"
          collapsed={collapsed}
          collapsedWidth={0}
        >
          <SiderBasic />
        </Layout.Sider>
      </Layout>
    </ConfigProvider>
  );
};
