import React, {useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Agency, UserRole} from "@/types/dataTypes.ts";
import {Button} from "@/components/ui/button.tsx";
import {Loader2} from "lucide-react";
import {toast} from "@/hooks/use-toast.ts";
import {fa} from "@faker-js/faker";

export enum MODAL_MODE {
    CREATE,
    UPDATE
}

type Props = {
    userData: UserFormData,
    isOpen: boolean,
    agencies: Agency[];
    onClose: () => void,
} & {
    onCreate?: (formData: UserFormData) => Promise<void>,
    onUpdate: (formData: Partial<UserFormData>) => Promise<void>,
    mode: MODAL_MODE.UPDATE
} | {
    onCreate: (formData: UserFormData) => Promise<void>,
    onUpdate?: (formData: Partial<UserFormData>) => Promise<void>,
    mode: MODAL_MODE.CREATE
}

type UserFormData = {
    name: string
    email: string
    password: string
    role: string
    agencyId?: string,
}
const defaultFormData = {
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
}


const userRoles = ['ADMIN', 'AGENCY_PARTNER', 'CLIENT'];

const ManageUserModal: React.FC<Props> = ({
                                              onClose,
                                              isOpen,
                                              mode = MODAL_MODE.CREATE,
                                              onCreate,
                                              onUpdate,
                                              agencies,
                                              userData
                                          }) => {

    const [formData, setFormData] = React.useState<UserFormData>(() => ({
        name: userData?.name ?? "",
        email: userData?.email ?? "",
        password: userData?.password ?? "",
        role: userData?.role ?? "CLIENT",
        agencyId: userData?.agencyId
    }));
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name ?? "",
                email: userData.email ?? "",
                password: userData.password ?? "",
                role: userData.role ?? "CLIENT",
                agencyId: userData.agencyId
            });
        }
    }, [userData]);

    const handleCreateUser = async () => {
        if (!formData.name || !formData.email) {
            toast({
                title: "Missing Information",
                description: "Please provide both name and email for the new user.",
                variant: "destructive",
            });
            return;
        }

        setIsCreating(true);
        try {
            await onCreate!(formData);
            toast({
                title: "User created",
                description: "New user has been successfully created.",
                variant: "default",
            });
        } catch (error) {
            console.error("Create user error:", error);
            toast({
                title: "Creation Failed",
                description: "Could not create the new user.",
                variant: "destructive",
            });
        } finally {
            setFormData(defaultFormData);
            setIsCreating(false);
            onClose();
        }
    };

    const handleEditSave = async () => {
        if (!formData) return;
        setIsUpdating(true);
        try {
            const updatedUser: UserFormData = {
                ...formData,
                agencyId: formData.role !== 'ADMIN' ? formData.agencyId : undefined,
            };
            console.log("updatedUser", updatedUser);
            await onUpdate!(updatedUser);
            toast({
                title: "User updated",
                description: "User details have been successfully updated.",
                variant: "default",
            });
        } catch (error) {
            console.error("Update error:", error);
            toast({
                title: "Update Failed",
                description: "Could not update the user.",
                variant: "destructive",
            });
        } finally {
            setFormData(defaultFormData);
            setIsUpdating(false);
            onClose();
        }
    };

    const handleClose = async () => {
        onClose()
        setFormData(defaultFormData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === MODAL_MODE.CREATE ? "Add New User" : "Update user information"}</DialogTitle>
                    <DialogDescription>
                        {mode === MODAL_MODE.CREATE ? "Create a new user account." : "Change an existing user account"}
                        Fill in the required information below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name ?? ""}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="col-span-3"
                            disabled={mode === MODAL_MODE.UPDATE}
                            placeholder="John Doe"
                            autoFocus={false}
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password ?? ""}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="col-span-3"
                            placeholder="********"
                            disabled={mode === MODAL_MODE.UPDATE}
                            autoFocus={false}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email ?? ""}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="col-span-3"
                            placeholder="john.doe@example.com"
                            disabled={mode === MODAL_MODE.UPDATE}
                            autoFocus={false}
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select
                            value={formData.role as string}
                            onValueChange={(value: UserRole) => setFormData({...formData, role: value})}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role"/>
                            </SelectTrigger>
                            <SelectContent>
                                {userRoles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.role === 'AGENCY_PARTNER' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="agency" className="text-right">
                                Agency
                            </Label>
                            <Select
                                value={formData.agencyId || ""}
                                onValueChange={(value) => setFormData({...formData, agencyId: value})}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select agency"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {agencies.map((agency) => (
                                        <SelectItem key={agency.id} value={agency.id}>
                                            {agency.name || agency.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={mode === MODAL_MODE.CREATE ? handleCreateUser : handleEditSave} disabled={isCreating}>
                        {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                        {mode === MODAL_MODE.CREATE ? "Create User" : "Update User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ManageUserModal;