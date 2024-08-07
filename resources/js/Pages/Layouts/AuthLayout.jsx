import { Link } from "@inertiajs/inertia-react";
import {
    ActionIcon,
    Affix,
    Box,
    Burger,
    Button,
    CloseButton,
    Divider,
    Drawer,
    Modal,
    NumberInput,
    SegmentedControl,
    SimpleGrid,
    Skeleton,
    Text,
    Transition,
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import {
    IconArrowUp,
    IconLink,
    IconLogout2,
    IconPhoto,
    IconSeparatorVertical,
    IconSignLeft,
    IconTag,
    IconTags,
    IconUpload,
    IconUser,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import sty from "../../../scss/authLayout.module.scss";
import DisabledInputInfo from "../Components/DisabledInputInfo";
import Logo from "../Components/Logo";
import MenuOption from "../Components/MenuOption";
import SearchTags from "../Components/SearchTags";

export default function AuthLayout({
    auth,
    children,
    className = "",
    queryTags = null, // [0] - value [1] - set new value
    segmentControl = null,
    page = null,
    setPage = (page) => console.log(`Page set to ${page}`),
    maxPage = 0,
    userTags = [],
}) {
    const [openedDrawer, drawer] = useDisclosure();
    const [openedUserModal, userModal] = useDisclosure();
    const [userInfo, setUserInfo] = useState(null);
    const [scroll, scrollTo] = useWindowScroll();

    // For page selection
    const firstLoad = useRef(true);
    const [pageError, setPageError] = useState(null);
    const [selectedPage, setSelectedPage] = useState(page);

    useEffect(() => {
        if (openedUserModal) {
            axios
                .get(route("user.modal.info"))
                .then((res) => {
                    setUserInfo(res.data);
                    console.log(res.data);
                })
                .catch((err) => {
                    alert("Error has appeared! Please check the console!");
                    console.error(err);
                });
        }
    }, [openedUserModal]);

    const defaultIconProps = {
        strokeWidth: 2,
        size: 24,
    };

    function onPageChangeHandler(page) {
        if (page < 1) {
            setPageError("Page number cannot be less than 1");
            return;
        }

        if (page > maxPage) {
            setPageError(`Page number cannot be over ${maxPage}`);
            return;
        }

        // Uses decimal
        if (page % 1 !== 0) {
            setPageError("Page number cannot be decimal");
            return;
        }

        setPageError(null);
        setSelectedPage(page); // Trigger use effect
    }

    // React to page selection
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            return;
        }

        const timeoutID = setTimeout(() => {
            setPage(selectedPage);
            drawer.close();
        }, 1000);
        return () => clearTimeout(timeoutID);
    }, [selectedPage]);

    useEffect(() => setSelectedPage(page), [page]);

    return (
        <div className={className} style={{ height: "100dvh", overflow: "auto" }}>
            <section id="top-section"></section>
            <Modal opened={openedUserModal} onClose={userModal.close} title={auth.user.username}>
                <SimpleGrid cols={2} spacing={"sm"} verticalSpacing={"sm"}>
                    {userInfo ? (
                        <>
                            <DisabledInputInfo
                                tooltip={"Total pictures uploaded"}
                                icon={<IconPhoto />}
                                value={userInfo.pictures}
                            />
                            <DisabledInputInfo
                                tooltip={"Total tags made"}
                                icon={<IconTags />}
                                value={userInfo.tags}
                            />
                            <DisabledInputInfo
                                tooltip={"Last picture was uploaded"}
                                icon={<IconUpload />}
                                value={userInfo.last_picture_uploaded}
                            />
                            <DisabledInputInfo
                                tooltip={"Last tag was made"}
                                icon={<IconTag />}
                                value={userInfo.last_tag_created}
                            />
                            <DisabledInputInfo
                                tooltip={"You created your account"}
                                icon={<IconUser />}
                                value={userInfo.user_created}
                            />
                        </>
                    ) : (
                        <>
                            <Skeleton w={"100%"} h={30} />
                            <Skeleton w={"100%"} h={30} />
                            <Skeleton w={"100%"} h={30} />
                            <Skeleton w={"100%"} h={30} />
                            <Skeleton w={"100%"} h={30} />
                        </>
                    )}
                </SimpleGrid>

                <Link href={route("logout")}>
                    <Button
                        onClick={() => setUserInfo(null)}
                        loading={!userInfo}
                        mt={"sm"}
                        leftSection={<IconLogout2 size={19} />}
                        size="xs"
                        color="red"
                    >
                        Logout
                    </Button>
                </Link>
            </Modal>

            <Drawer
                padding={0}
                opened={openedDrawer}
                withCloseButton={false}
                onClose={drawer.close}
                size={"sm"}
            >
                <div className={sty.menu_header}>
                    <span
                        onClick={() => {
                            drawer.close();
                            userModal.open();
                        }}
                    >
                        Hi {auth.user.username}
                    </span>
                    <CloseButton onClick={drawer.close} />
                </div>
                <div className={sty.menu}>
                    <MenuOption
                        currentRoute={auth.route}
                        icon={<IconPhoto {...defaultIconProps} />}
                        text={"Pictures"}
                        hrefRoute={"dashboard"}
                    />
                    <MenuOption
                        currentRoute={auth.route}
                        icon={<IconUpload {...defaultIconProps} />}
                        text={"Upload pictures"}
                        hrefRoute={"upload.index"}
                    />
                    <MenuOption
                        currentRoute={auth.route}
                        icon={<IconTags {...defaultIconProps} />}
                        text={"Manage tags"}
                        hrefRoute={"tags.index"}
                    />
                    <MenuOption
                        currentRoute={auth.route}
                        icon={<IconLink {...defaultIconProps} />}
                        text={"Shared links"}
                        hrefRoute={"share.links.manage"}
                    />
                </div>

                {auth.route === "dashboard" && (
                    <>
                        <Divider
                            my={16}
                            label={
                                <>
                                    <IconTags size={16} />
                                    <Box ml={4}>Filter by tags</Box>
                                </>
                            }
                        />
                        <SearchTags
                            queryTags={queryTags}
                            userTags={userTags}
                            closeDrawer={() => drawer.close()}
                        />

                        <Divider
                            my={16}
                            label={
                                <>
                                    <IconSeparatorVertical size={16} />
                                    <Box ml={4}>Separate pictures</Box>
                                </>
                            }
                        />
                        <SegmentedControl
                            fullWidth
                            mx={8}
                            value={segmentControl[0]}
                            onChange={segmentControl[1]}
                            data={[
                                { label: "All", value: "all" },
                                { label: "Year", value: "year" },
                                { label: "Month", value: "month" },
                                { label: "Day", value: "day" },
                            ]}
                        />

                        <Divider
                            my={16}
                            label={
                                <>
                                    <IconSignLeft size={16} />
                                    <Box ml={4}>Jump to page</Box>
                                </>
                            }
                        />

                        <NumberInput
                            onChange={onPageChangeHandler}
                            value={selectedPage}
                            placeholder="Enter page number"
                            mx={8}
                            mb={16}
                            min={1}
                            max={maxPage}
                            error={pageError}
                        />
                    </>
                )}
            </Drawer>

            <nav className={sty.nav}>
                <div className={sty.logo} onClick={() => drawer.open()}>
                    <Logo size={50} />
                    <Text fw={500}>Picuss</Text>
                </div>

                <Burger
                    opened={openedDrawer}
                    onClick={drawer.toggle}
                    aria-label="Toggle navigation"
                />
            </nav>

            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition="slide-up" mounted={scroll.y > 0}>
                    {(transitionStyles) => (
                        <ActionIcon
                            variant="subtle"
                            style={transitionStyles}
                            onClick={() => scrollTo({ y: 0 })}
                        >
                            <IconArrowUp strokeWidth={1.5} />
                        </ActionIcon>
                    )}
                </Transition>
            </Affix>

            {children}
        </div>
    );
}
