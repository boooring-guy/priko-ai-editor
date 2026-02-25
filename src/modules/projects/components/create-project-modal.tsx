import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FolderIcon,
  Loader2,
  Plus,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "../hooks";
import { generateProjectTitle } from "@/utils/project-title";
import { toast } from "sonner";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(50),
  description: z.string().max(255).optional(),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

export const CreateProjectModal = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { mutate: createProject, isPending } = useCreateProject();

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleRefreshTitle = () => {
    form.setValue("name", generateProjectTitle());
  };

  useEffect(() => {
    if (open && !form.getValues("name")) {
      handleRefreshTitle();
    }
  }, [open, form]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSubmit = (values: CreateProjectValues) => {
    createProject(values, {
      onSuccess: () => {
        toast.success("Project created successfully");
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to create project",
        );
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Create Project
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto p-6 sm:w-1/2 sm:max-w-none">
        <SheetHeader className="p-0">
          <SheetTitle>Create Project</SheetTitle>
          <SheetDescription>
            Create a new project to start collaborating.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>
                          <FolderIcon className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="My awesome project"
                        disabled={isPending}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          onClick={handleRefreshTitle}
                          disabled={isPending}
                          title="Generate random title"
                        >
                          <RefreshCw
                            className={cn(
                              "size-3",
                              isPending && "animate-spin",
                            )}
                          />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="block-start">
                        <InputGroupText>
                          <FileText className="size-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupTextarea
                        placeholder="What is this project about?"
                        disabled={isPending}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                <ButtonGroupSeparator />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Create Project
                </Button>
              </ButtonGroup>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
