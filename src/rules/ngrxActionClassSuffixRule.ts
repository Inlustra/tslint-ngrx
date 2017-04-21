
import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ActionClassWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class ActionClassWalker extends Lint.RuleWalker {

    requiredPrefix = this.getOptions() && this.getOptions()[0] || 'Action'

    public visitClassDeclaration(node: ts.ClassDeclaration) {
        if (!node.name || !this.isActionClass(node)) return;
        if (!node.name.text.endsWith(this.requiredPrefix)) {
            const fix = new Lint.Replacement(
                0,
                node.name.text.length,
                node.name.text + this.requiredPrefix);
            this.addFailure(
                this.createFailure(
                    node.name.getStart(),
                    node.name.text.length,
                    this.getFailureString(),
                    fix)
            );
        }
    }

    isActionClass(node: ts.ClassDeclaration): boolean {
        if (!node.heritageClauses) return false;
        return node.heritageClauses
            .filter(clause => !!clause.types)
            .some(clause => clause.types.some(
                type => type.getText() === 'Action'));
    }

    getFailureString() {
        return `Actions should be suffixed with '${this.requiredPrefix}'`
    }

}
